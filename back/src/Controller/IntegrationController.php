<?php

namespace App\Controller;

use App\DTO\QueryParam\Integration\InstagramCallbackQueryParamDTO;
use App\DTO\QueryParam\Integration\ListIntegrationsQueryParamDTO;
use App\DTO\Redis\Integration\IntegrationStateRedisDTO;
use App\DTO\Request\Integration\CreateIntegrationRequestDTO;
use App\DTO\Response\Integration\CreateIntegrationResponseDTO;
use App\DTO\Response\Integration\OAuthCallbackResponseDTO;
use App\Entity\Enum\IntegrationPlatform;
use App\Entity\Enum\IntegrationStatus;
use App\Entity\Enum\OAuthCallbackStatus;
use App\Entity\Enum\OAuthErrorCode;
use App\Entity\User;
use App\Repository\IntegrationRepository;
use App\Repository\ProjectRepository;
use App\Repository\UserRepository;
use App\Service\Integration\InstagramOAuthService;
use App\Service\Integration\IntegrationService;
use App\Service\Integration\YoutubeOAuthService;
use App\Service\RedisStore\RedisStoreService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Requirement\Requirement;

#[Route('/api/integrations', requirements: ['integrationUuid' => Requirement::UUID])]
final class IntegrationController extends AbstractController
{
    public function __construct(
        private readonly string $frontendUrl,
    ) {
    }

    #[Route('', name: 'api_integrations_list', methods: ['GET'])]
    public function list(
        ListIntegrationsQueryParamDTO $queryParamDto,
        ProjectRepository $projectRepository,
        IntegrationRepository $integrationRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getByUuidAndUser($queryParamDto->getProjectUuid(), $user);

        if ($project === null) {
            return $this->json(
                data: ["message" => "You don't have any project with this uuid"],
                status: Response::HTTP_NOT_FOUND
            );
        }

        $integrations = $integrationRepository->getByProjectAndUser($project, $user);

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
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getByUuidAndUser($dto->getProjectUuid(), $user);

        if ($project === null) {
            return $this->json(
                data: ["message" => "You don't have any project with this uuid"],
                status: Response::HTTP_NOT_FOUND
            );
        }

        $existingIntegration = $integrationRepository->getOneByProjectAndPlatformAndStatus($project, $dto->getPlatform(), IntegrationStatus::Active);

        if ($existingIntegration !== null) {
            return $this->json(
                data: ["message" => "This project already has an integration for this platform"],
                status: Response::HTTP_CONFLICT
            );
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
            IntegrationPlatform::Instagram => $instagramOAuthService->getAuthorizationUrl($state),
            IntegrationPlatform::Youtube => $youtubeOAuthService->getAuthorizationUrl($state),
        };

        $responseDto = (new CreateIntegrationResponseDTO($authorizationUrl))->getData();

        return $this->json(
            data: $responseDto,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_integrations_create']]
        );
    }

    #[Route('/{integrationPlatform}/callback', name: 'api_integrations_callback', methods: ['GET'])]
    public function callback(
        IntegrationPlatform $integrationPlatform,
        InstagramCallbackQueryParamDTO $queryParamDto,
        UserRepository $userRepository,
        ProjectRepository $projectRepository,
        RedisStoreService $redisStoreService,
        InstagramOAuthService $instagramOAuthService,
        YoutubeOAuthService $youtubeOAuthService,
    ): Response {
        $code = $queryParamDto->getCode();
        $state = $queryParamDto->getState();
        $error = $queryParamDto->getError();

        $stateDataJson = $redisStoreService->get(
            RedisStoreService::getIntegrationStateKey($state)
        );

        if ($stateDataJson === null) {
            return $this->redirectToFrontendCallback(OAuthCallbackStatus::Error, $integrationPlatform, OAuthErrorCode::InvalidState);
        }

        $stateModel = IntegrationStateRedisDTO::fromJson($stateDataJson);

        if ($stateModel->getPlatform() !== $integrationPlatform) {
            return $this->redirectToFrontendCallback(OAuthCallbackStatus::Error, $integrationPlatform, OAuthErrorCode::InvalidState);
        }

        if ($error !== null) {
            return $this->redirectToFrontendCallback(OAuthCallbackStatus::Error, $integrationPlatform, OAuthErrorCode::PlatformError);
        }

        if ($code === null) {
            return $this->redirectToFrontendCallback(OAuthCallbackStatus::Error, $integrationPlatform, OAuthErrorCode::MissingCode);
        }

        $user = $userRepository->getByUuid($stateModel->getUserUuid());

        if ($user === null) {
            return $this->redirectToFrontendCallback(OAuthCallbackStatus::Error, $integrationPlatform, OAuthErrorCode::UserNotFound);
        }

        $project = $projectRepository->getByUuidAndUser($stateModel->getProjectUuid(), $user);

        if ($project === null) {
            return $this->redirectToFrontendCallback(OAuthCallbackStatus::Error, $integrationPlatform, OAuthErrorCode::UserNotFound);
        }

        try {
            $integration = match ($integrationPlatform) {
                IntegrationPlatform::Instagram => $instagramOAuthService->handleCallback($code, $user, $project),
                IntegrationPlatform::Youtube => $youtubeOAuthService->handleCallback($code, $user, $project),
            };

            $redisStoreService->delete(
                RedisStoreService::getIntegrationStateKey($state)
            );

            return $this->redirectToFrontendCallback(OAuthCallbackStatus::Success, $integrationPlatform, null, $integration->getUuid());
        } catch (\Exception $e) {
            return $this->redirectToFrontendCallback(OAuthCallbackStatus::Error, $integrationPlatform, OAuthErrorCode::TokenExchangeFailed);
        }
    }

    private function redirectToFrontendCallback(
        OAuthCallbackStatus $status,
        IntegrationPlatform $platform,
        ?OAuthErrorCode $errorCode = null,
        ?string $integrationUuid = null
    ): Response {
        $dto = new OAuthCallbackResponseDTO($status, $platform, $errorCode, $integrationUuid);
        return $this->redirect(
            $this->frontendUrl . '/integrations/callback?' . http_build_query($dto->getData())
        );
    }

    #[Route('/{integrationUuid}', name: 'api_integrations_show', methods: ['GET'])]
    public function show(string $integrationUuid, IntegrationRepository $integrationRepository): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $integration = $integrationRepository->getByUuidAndUser($integrationUuid, $user);

        if ($integration === null) {
            return $this->json(
                data: ["message" => "You don't have any integration with this uuid"],
                status: Response::HTTP_NOT_FOUND
            );
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

        $integration = $integrationRepository->getByUuidAndUser($integrationUuid, $user);

        if ($integration === null) {
            return $this->json(
                data: ["message" => "You don't have any integration with this uuid"],
                status: Response::HTTP_NOT_FOUND
            );
        }

        $integrationRepository->remove($integration, true);

        return $this->json(
            data: ["message" => "Integration deleted successfully"],
            status: Response::HTTP_OK
        );
    }

    #[Route('/platforms/{platform}/icon', name: 'api_integrations_platform_icon', methods: ['GET'])]
    public function getPlatformIcon(string $platform, IntegrationService $integrationService): Response
    {
        $iconFile = $integrationService->getIntegrationPlatformIcon($platform);

        return new BinaryFileResponse(
            $iconFile,
            Response::HTTP_OK,
            ['Content-Type' => $iconFile->getMimeType()],
            false,
            ResponseHeaderBag::DISPOSITION_INLINE
        );
    }
}
