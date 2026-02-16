<?php

namespace App\Controller;

use App\DTO\QueryParam\Integration\InstagramCallbackQueryParamDTO;
use App\DTO\QueryParam\Integration\ListIntegrationsQueryParamDTO;
use App\DTO\Redis\Integration\IntegrationStateRedisDTO;
use App\DTO\Request\Integration\CreateIntegrationRequestDTO;
use App\DTO\Response\Integration\CreateIntegrationResponseDTO;
use App\DTO\Response\Integration\OAuthCallbackResponseDTO;
use App\Entity\Enum\IntegrationProvider;
use App\Entity\Enum\IntegrationStatus;
use App\Entity\Enum\OAuthCallbackStatus;
use App\Entity\Enum\OAuthErrorCode;
use App\Entity\User;
use App\Repository\IntegrationRepository;
use App\Repository\UserModuleRepository;
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

#[Route('/api/integrations')]
final class IntegrationController extends AbstractController
{
    public function __construct(
        private readonly string $frontendUrl,
    ) {
    }

    #[Route('', name: 'api_integrations_list', methods: ['GET'])]
    public function list(
        ListIntegrationsQueryParamDTO $queryParamDto,
        UserModuleRepository $userModuleRepository,
        IntegrationRepository $integrationRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $userModule = $userModuleRepository->getByUuidAndUser($queryParamDto->getUserModuleUuid(), $user);

        if ($userModule === null) {
            return $this->json(
                data: ["message" => "You don't have any user module with this uuid"],
                status: Response::HTTP_NOT_FOUND
            );
        }

        $integrations = $integrationRepository->getByUserModuleAndStatus($userModule, IntegrationStatus::Active);

        return $this->json(
            data: $integrations,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_integrations_list']]
        );
    }

    #[Route('', name: 'api_integrations_create', methods: ['POST'])]
    public function create(
        CreateIntegrationRequestDTO $dto,
        UserModuleRepository $userModuleRepository,
        IntegrationRepository $integrationRepository,
        RedisStoreService $redisStoreService,
        InstagramOAuthService $instagramOAuthService,
        YoutubeOAuthService $youtubeOAuthService,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $userModule = $userModuleRepository->getByUuidAndUser($dto->getUserModuleUuid(), $user);

        if ($userModule === null) {
            return $this->json(
                data: ["message" => "You don't have any user module with this uuid"],
                status: Response::HTTP_NOT_FOUND
            );
        }

        $existingIntegration = $integrationRepository->getOneByUserModuleAndProvider($userModule, $dto->getProvider());

        if ($existingIntegration !== null) {
            return $this->json(
                data: ["message" => "This user module already has an integration for this provider"],
                status: Response::HTTP_CONFLICT
            );
        }

        $state = bin2hex(random_bytes(16));

        $stateModel = new IntegrationStateRedisDTO(
            $user->getUuid(),
            $userModule->getUuid(),
            $dto->getProvider(),
        );

        $redisStoreService->set(
            RedisStoreService::getIntegrationStateKey($state),
            $stateModel->toJson(),
            time() + 60 * 5
        );

        $authorizationUrl = match ($dto->getProvider()) {
            IntegrationProvider::Instagram => $instagramOAuthService->getAuthorizationUrl($state),
            IntegrationProvider::Youtube => $youtubeOAuthService->getAuthorizationUrl($state),
        };

        $responseDto = (new CreateIntegrationResponseDTO($authorizationUrl))->getData();

        return $this->json(
            data: $responseDto,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_integrations_create']]
        );
    }

    #[Route('/{integrationProvider}/callback', name: 'api_integrations_callback', methods: ['GET'])]
    public function callback(
        IntegrationProvider $integrationProvider,
        InstagramCallbackQueryParamDTO $queryParamDto,
        UserRepository $userRepository,
        UserModuleRepository $userModuleRepository,
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
            return $this->redirectToFrontendCallback(OAuthCallbackStatus::Error, $integrationProvider, OAuthErrorCode::InvalidState);
        }

        $stateModel = IntegrationStateRedisDTO::fromJson($stateDataJson);

        if ($stateModel->getProvider() !== $integrationProvider) {
            dd($stateModel->getProvider(), $integrationProvider);
            return $this->redirectToFrontendCallback(OAuthCallbackStatus::Error, $integrationProvider, OAuthErrorCode::InvalidState);
        }

        if ($error !== null) {
            return $this->redirectToFrontendCallback(OAuthCallbackStatus::Error, $integrationProvider, OAuthErrorCode::ProviderError);
        }

        if ($code === null) {
            return $this->redirectToFrontendCallback(OAuthCallbackStatus::Error, $integrationProvider, OAuthErrorCode::MissingCode);
        }

        $user = $userRepository->getByUuid($stateModel->getUserUuid());

        if ($user === null) {
            return $this->redirectToFrontendCallback(OAuthCallbackStatus::Error, $integrationProvider, OAuthErrorCode::UserNotFound);
        }

        $userModule = $userModuleRepository->getByUuidAndUser($stateModel->getUserModuleUuid(), $user);

        if ($userModule === null) {
            return $this->redirectToFrontendCallback(OAuthCallbackStatus::Error, $integrationProvider, OAuthErrorCode::UserNotFound);
        }

        try {
            $integration = match ($integrationProvider) {
                IntegrationProvider::Instagram => $instagramOAuthService->handleCallback($code, $user, $userModule),
                IntegrationProvider::Youtube => $youtubeOAuthService->handleCallback($code, $user, $userModule),
            };

            $redisStoreService->delete(
                RedisStoreService::getIntegrationStateKey($state)
            );

            return $this->redirectToFrontendCallback(OAuthCallbackStatus::Success, $integrationProvider, null, $integration->getUuid());
        } catch (\Exception $e) {
            return $this->redirectToFrontendCallback(OAuthCallbackStatus::Error, $integrationProvider, OAuthErrorCode::TokenExchangeFailed);
        }
    }

    private function redirectToFrontendCallback(
        OAuthCallbackStatus $status,
        IntegrationProvider $provider,
        ?OAuthErrorCode $errorCode = null,
        ?string $integrationUuid = null
    ): Response {
        $dto = new OAuthCallbackResponseDTO($status, $provider, $errorCode, $integrationUuid);
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

    #[Route('/providers/{provider}/icon', name: 'api_integrations_provider_icon', methods: ['GET'])]
    public function getProviderIcon(string $provider, IntegrationService $integrationService): Response
    {
        $iconFile = $integrationService->getIntegrationProviderIcon($provider);

        return new BinaryFileResponse(
            $iconFile,
            Response::HTTP_OK,
            ['Content-Type' => $iconFile->getMimeType()],
            false,
            ResponseHeaderBag::DISPOSITION_INLINE
        );
    }
}
