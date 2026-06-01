<?php

namespace App\Controller;

use App\DTO\QueryParam\Integration\InstagramCallbackQueryParamDTO;
use App\DTO\QueryParam\Integration\ListIntegrationsQueryParamDTO;
use App\DTO\Redis\Integration\IntegrationStateRedisDTO;
use App\DTO\Request\Integration\CreateIntegrationRequestDTO;
use App\DTO\Response\Integration\CreateIntegrationResponseDTO;
use App\DTO\Response\Integration\OAuthCallbackResponseDTO;
use App\Entity\Enum\Platform;
use App\Entity\Enum\IntegrationStatus;
use App\Entity\Enum\OAuthCallbackStatus;
use App\Entity\Enum\OAuthErrorCode;
use App\Entity\Enum\UserRole;
use App\Entity\User;
use App\Exception\Integration\IntegrationAlreadyExistsException;
use App\Exception\Integration\IntegrationNotFoundException;
use App\Exception\Project\ProjectNotFoundException;
use App\Repository\IntegrationRepository;
use App\Repository\ProjectRepository;
use App\Repository\UserRepository;
use App\Security\Voter\ProjectVoter;
use App\Service\Integration\InstagramOAuthService;
use App\Service\Integration\TiktokOAuthService;
use App\Service\Integration\YoutubeOAuthService;
use App\Service\RedisStore\RedisStoreService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Requirement\Requirement;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/integrations', requirements: ['integrationUuid' => Requirement::UUID])]
final class IntegrationController extends AbstractController
{
    public function __construct(
        private readonly string $frontendUrl,
    ) {
    }

    #[Route('', name: 'api_integrations_list', methods: ['GET'])]
    #[IsGranted(UserRole::User->value)]
    public function list(
        ListIntegrationsQueryParamDTO $queryParamDto,
        ProjectRepository $projectRepository,
        IntegrationRepository $integrationRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getAccessibleByUuidForUser($queryParamDto->getProjectUuid(), $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        $integrations = $integrationRepository->getByProject($project);

        return $this->json(
            data: $integrations,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_integrations_list']]
        );
    }

    #[Route('', name: 'api_integrations_create', methods: ['POST'])]
    public function create(
        CreateIntegrationRequestDTO $dto,
        ProjectRepository $projectRepository,
        IntegrationRepository $integrationRepository,
        RedisStoreService $redisStoreService,
        InstagramOAuthService $instagramOAuthService,
        YoutubeOAuthService $youtubeOAuthService,
        TiktokOAuthService $tiktokOAuthService,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getAccessibleByUuidForUser($dto->getProjectUuid(), $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        // Editors+ on the agency, or the client linked to this project, may connect integrations.
        $this->denyAccessUnlessGranted(ProjectVoter::MANAGE_INTEGRATIONS, $project);

        $existingIntegration = $integrationRepository->getOneByProjectAndPlatformAndStatus($project, $dto->getPlatform(), IntegrationStatus::Active);

        if ($existingIntegration !== null) {
            throw new IntegrationAlreadyExistsException();
        }

        $state = bin2hex(random_bytes(16));

        $stateModel = new IntegrationStateRedisDTO(
            $user->getUuid(),
            $project->getUuid(),
            $dto->getPlatform(),
        );

        $redisStoreService->set(
            RedisStoreService::getIntegrationStateKey($state),
            $stateModel->toJson(),
            time() + 60 * 5
        );

        $authorizationUrl = match ($dto->getPlatform()) {
            Platform::Instagram => $instagramOAuthService->getAuthorizationUrl($state),
            Platform::Youtube => $youtubeOAuthService->getAuthorizationUrl($state),
            Platform::Tiktok => $tiktokOAuthService->getAuthorizationUrl($state),
        };

        $responseDto = (new CreateIntegrationResponseDTO($authorizationUrl))->getData();

        return $this->json(
            data: $responseDto,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_integrations_create']]
        );
    }

    #[Route('/{platform}/callback', name: 'api_integrations_callback', methods: ['GET'])]
    public function callback(
        Platform $platform,
        InstagramCallbackQueryParamDTO $queryParamDto,
        UserRepository $userRepository,
        ProjectRepository $projectRepository,
        RedisStoreService $redisStoreService,
        InstagramOAuthService $instagramOAuthService,
        YoutubeOAuthService $youtubeOAuthService,
        TiktokOAuthService $tiktokOAuthService,
    ): Response {
        $code = $queryParamDto->getCode();
        $state = $queryParamDto->getState();
        $error = $queryParamDto->getError();

        $stateDataJson = $redisStoreService->get(
            RedisStoreService::getIntegrationStateKey($state)
        );

        if ($stateDataJson === null) {
            return $this->redirectToFrontendCallback(OAuthCallbackStatus::Error, $platform, OAuthErrorCode::InvalidState);
        }

        $stateModel = IntegrationStateRedisDTO::fromJson($stateDataJson);

        if ($stateModel->getPlatform() !== $platform) {
            return $this->redirectToFrontendCallback(OAuthCallbackStatus::Error, $platform, OAuthErrorCode::InvalidState);
        }

        if ($error !== null) {
            return $this->redirectToFrontendCallback(OAuthCallbackStatus::Error, $platform, OAuthErrorCode::PlatformError);
        }

        if ($code === null) {
            return $this->redirectToFrontendCallback(OAuthCallbackStatus::Error, $platform, OAuthErrorCode::MissingCode);
        }

        $user = $userRepository->getByUuid($stateModel->getUserUuid());

        if ($user === null) {
            return $this->redirectToFrontendCallback(OAuthCallbackStatus::Error, $platform, OAuthErrorCode::UserNotFound);
        }

        $project = $projectRepository->getAccessibleByUuidForUser($stateModel->getProjectUuid(), $user);

        if ($project === null) {
            return $this->redirectToFrontendCallback(OAuthCallbackStatus::Error, $platform, OAuthErrorCode::UserNotFound);
        }

        try {
            $integration = match ($platform) {
                Platform::Instagram => $instagramOAuthService->handleCallback($code, $user, $project),
                Platform::Youtube => $youtubeOAuthService->handleCallback($code, $user, $project),
                Platform::Tiktok => $tiktokOAuthService->handleCallback($code, $user, $project),
            };

            $redisStoreService->delete(
                RedisStoreService::getIntegrationStateKey($state)
            );

            return $this->redirectToFrontendCallback(OAuthCallbackStatus::Success, $platform, null, $integration->getUuid());
        } catch (\Exception $e) {
            return $this->redirectToFrontendCallback(OAuthCallbackStatus::Error, $platform, OAuthErrorCode::TokenExchangeFailed);
        }
    }

    private function redirectToFrontendCallback(
        OAuthCallbackStatus $status,
        Platform $platform,
        ?OAuthErrorCode $errorCode = null,
        ?string $integrationUuid = null
    ): Response {
        $dto = new OAuthCallbackResponseDTO($status, $platform, $errorCode, $integrationUuid);
        return $this->redirect(
            $this->frontendUrl . '/integrations/callback?' . http_build_query($dto->getData())
        );
    }

    #[Route('/{integrationUuid}', name: 'api_integrations_show', methods: ['GET'])]
    #[IsGranted(UserRole::User->value)]
    public function show(string $integrationUuid, IntegrationRepository $integrationRepository): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $integration = $integrationRepository->getAccessibleByUuidForUser($integrationUuid, $user);

        if ($integration === null) {
            throw new IntegrationNotFoundException();
        }

        return $this->json(
            data: $integration,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_integrations_show']]
        );
    }

    #[Route('/{integrationUuid}', name: 'api_integrations_delete', methods: ['DELETE'])]
    public function delete(string $integrationUuid, IntegrationRepository $integrationRepository): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $integration = $integrationRepository->getAccessibleByUuidForUser($integrationUuid, $user);

        if ($integration === null) {
            throw new IntegrationNotFoundException();
        }

        // Editors+ on the agency, or the client linked to this project, may delete integrations.
        $this->denyAccessUnlessGranted(ProjectVoter::MANAGE_INTEGRATIONS, $integration->getProject());

        $integrationRepository->remove($integration, true);

        return $this->json(
            data: ["message" => "Integration deleted successfully"],
            status: Response::HTTP_OK
        );
    }

    #[Route('/{integrationUuid}/tokens', name: 'api_integrations_revoke_tokens', methods: ['DELETE'])]
    public function revokeTokens(string $integrationUuid, IntegrationRepository $integrationRepository): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $integration = $integrationRepository->getAccessibleByUuidForUser($integrationUuid, $user);

        if ($integration === null) {
            throw new IntegrationNotFoundException();
        }

        // Editors+ on the agency, or the client linked to this project, may revoke integration tokens.
        $this->denyAccessUnlessGranted(ProjectVoter::MANAGE_INTEGRATIONS, $integration->getProject());

        $integration
            ->setAccessToken(null)
            ->setRefreshToken(null)
            ->setRefreshTokenExpiresAt(null)
            ->setExpiresAt(null)
            ->setStatus(IntegrationStatus::Revoked);

        $integrationRepository->save($integration, true);

        return $this->json(
            data: ["message" => "Integration tokens revoked successfully"],
            status: Response::HTTP_OK
        );
    }
}
