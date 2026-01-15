<?php

namespace App\Controller;

use App\DTO\QueryParam\Integration\InstagramCallbackQueryParamDTO;
use App\DTO\QueryParam\Integration\ListIntegrationsQueryParamDTO;
use App\DTO\Response\Integration\AuthorizeInstagramIntegrationResponseDTO;
use App\DTO\Response\Integration\RedirectToFrontendCallbackResponseDTO;
use App\Entity\Enum\IntegrationProvider;
use App\Entity\Enum\OAuthCallbackStatus;
use App\Entity\Enum\OAuthErrorCode;
use App\Entity\User;
use App\Repository\IntegrationRepository;
use App\Repository\UserRepository;
use App\Service\Integration\InstagramOAuthService;
use App\Service\RedisStore\RedisStoreService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/integrations')]
final class IntegrationController extends AbstractController
{
    public function __construct(
        private readonly IntegrationRepository $integrationRepository,
        private readonly InstagramOAuthService $instagramOAuthService,
        private readonly RedisStoreService $redisStoreService,
        private readonly string $frontendUrl,
    ) {}

    #[Route('', name: 'api_integrations_list', methods: ['GET'])]
    public function list(ListIntegrationsQueryParamDTO $queryParamDto): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $integrations = $this->integrationRepository->getByUserPaginated(
            $user,
            $queryParamDto->getPage(),
            $queryParamDto->getLimit()
        );

        return $this->json(
            data: $integrations,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_integrations_list']]
        );
    }

    #[Route('/instagram/authorize', name: 'api_integrations_instagram_authorize', methods: ['GET'])]
    public function instagramAuthorize(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        // CSRF protection: random state stored in session and validated in callback
        $state = bin2hex(random_bytes(16));

        $this->redisStoreService->set(
            $this->redisStoreService->getIntegrationInstagramStateKey($state),
            $user->getUuid(),
            time() + 60 * 5 // 5 minutes
        );

        $responseDto = (new AuthorizeInstagramIntegrationResponseDTO(
            $this->instagramOAuthService->getAuthorizationUrl($state)
        ))->getData();

        return $this->json(
            data: $responseDto,
            status: Response::HTTP_OK
        );
    }

    #[Route('/instagram/callback', name: 'api_integrations_instagram_callback', methods: ['GET'])]
    public function instagramCallback(
        UserRepository $userRepository,
        InstagramCallbackQueryParamDTO $queryParamDto
    ): Response {
        $code = $queryParamDto->getCode();
        $state = $queryParamDto->getState();
        $error = $queryParamDto->getError();

        if ($error !== null) {
            return $this->redirectToFrontendCallback(OAuthCallbackStatus::Error, IntegrationProvider::Instagram, OAuthErrorCode::ProviderError);
        }

        $userUuid = $this->redisStoreService->get(
            RedisStoreService::getIntegrationInstagramStateKey($state)
        );

        if ($userUuid === null) {
            return $this->redirectToFrontendCallback(OAuthCallbackStatus::Error, IntegrationProvider::Instagram, OAuthErrorCode::InvalidState);
        }

        $this->redisStoreService->delete(
            RedisStoreService::getIntegrationInstagramStateKey($state)
        );

        if ($code === null) {
            return $this->redirectToFrontendCallback(OAuthCallbackStatus::Error, IntegrationProvider::Instagram, OAuthErrorCode::MissingCode);
        }

        try {
            $shortLivedToken = $this->instagramOAuthService->exchangeCodeForToken($code);
            $longLivedToken = $this->instagramOAuthService->exchangeForLongLivedToken($shortLivedToken->getAccessToken());
            $instagramUserProfile = $this->instagramOAuthService->getUserProfile($longLivedToken->getAccessToken());

            $user = $userRepository->getByUuid($userUuid);

            if ($user === null) {
                return $this->redirectToFrontendCallback(OAuthCallbackStatus::Error, IntegrationProvider::Instagram, OAuthErrorCode::UserNotFound);
            }

            $existingIntegration = $this->integrationRepository->getByUserAndProviderAndExternalAccountId(
                $user,
                IntegrationProvider::Instagram,
                $instagramUserProfile->getUserId()
            );

            if ($existingIntegration !== null) {
                $integration = $this->instagramOAuthService->updateIntegrationToken($existingIntegration, $longLivedToken);
            } else {
                $integration = $this->instagramOAuthService->createIntegration($user, $longLivedToken, $instagramUserProfile);
            }

            return $this->redirectToFrontendCallback(OAuthCallbackStatus::Success, IntegrationProvider::Instagram, null, $integration->getUuid());
        } catch (\Exception $e) {
            return $this->redirectToFrontendCallback(OAuthCallbackStatus::Error, IntegrationProvider::Instagram, OAuthErrorCode::TokenExchangeFailed);
        }
    }

    private function redirectToFrontendCallback(
        OAuthCallbackStatus $status,
        IntegrationProvider $provider,
        ?OAuthErrorCode $errorCode = null,
        ?string $integrationUuid = null
    ): Response {
        $dto = new RedirectToFrontendCallbackResponseDTO($status, $provider, $errorCode, $integrationUuid);
        return $this->redirect(
            $this->frontendUrl . '/integrations/callback?' . http_build_query($dto->getData())
        );
    }

    #[Route('/instagram/{integrationUuid}/refresh', name: 'api_integrations_instagram_refresh', methods: ['POST'])]
    public function instagramRefresh(string $integrationUuid): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $integration = $this->integrationRepository->getByUuidAndUser($integrationUuid, $user);

        if ($integration === null) {
            return $this->json(
                data: ["message" => "You don't have any integration with this uuid"],
                status: Response::HTTP_NOT_FOUND
            );
        }

        if ($integration->getProvider() !== IntegrationProvider::Instagram) {
            return $this->json(
                data: ["message" => "This integration is not an Instagram integration"],
                status: Response::HTTP_BAD_REQUEST
            );
        }

        try {
            $tokenData = $this->instagramOAuthService->refreshToken($integration->getAccessToken());
            $this->instagramOAuthService->updateIntegrationToken($integration, $tokenData);

            return $this->json(
                data: ["message" => "Token refreshed successfully"],
                status: Response::HTTP_OK
            );
        } catch (\Exception $e) {
            return $this->json(
                data: ["message" => "Failed to refresh token"],
                status: Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    #[Route('/{integrationUuid}', name: 'api_integrations_show', methods: ['GET'])]
    public function show(string $integrationUuid): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $integration = $this->integrationRepository->getByUuidAndUser($integrationUuid, $user);

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
    public function delete(string $integrationUuid): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $integration = $this->integrationRepository->getByUuidAndUser($integrationUuid, $user);

        if ($integration === null) {
            return $this->json(
                data: ["message" => "You don't have any integration with this uuid"],
                status: Response::HTTP_NOT_FOUND
            );
        }

        $this->integrationRepository->remove($integration, true);

        return $this->json(
            data: ["message" => "Integration deleted successfully"],
            status: Response::HTTP_OK
        );
    }
}
