<?php

namespace App\Controller;

use App\DTO\QueryParam\Integration\InstagramCallbackQueryParamDTO;
use App\DTO\QueryParam\Integration\ListIntegrationsQueryParamDTO;
use App\DTO\Response\Integration\InstagramAuthorizeIntegrationResponseDTO;
use App\Entity\Enum\IntegrationProvider;
use App\Entity\User;
use App\Repository\IntegrationRepository;
use App\Service\Integration\InstagramOAuthService;
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

        $request->getSession()->set('instagram_oauth_state', $state);
        $request->getSession()->set('instagram_oauth_user_id', $user->getId());

        $responseDto = (new InstagramAuthorizeIntegrationResponseDTO(
            $this->instagramOAuthService->getAuthorizationUrl($state)
        ))->getData();

        return $this->json(
            data: $responseDto,
            status: Response::HTTP_OK
        );
    }

    #[Route('/instagram/callback', name: 'api_integrations_instagram_callback', methods: ['GET'])]
    public function instagramCallback(Request $request, InstagramCallbackQueryParamDTO $queryParamDto): Response
    {
        $code = $queryParamDto->getCode();
        $state = $queryParamDto->getState();
        $error = $queryParamDto->getError();

        if ($error !== null) {
            return $this->redirect(
                $this->frontendUrl . '/integrations/callback?status=error&provider=instagram&error=' . $error
            );
        }

        $sessionState = $request->getSession()->get('instagram_oauth_state');
        $userId = $request->getSession()->get('instagram_oauth_user_id');

        if ($state !== $sessionState) {
            return $this->redirect(
                $this->frontendUrl . '/integrations/callback?status=error&provider=instagram&error=invalid_state'
            );
        }

        if ($code === null) {
            return $this->redirect(
                $this->frontendUrl . '/integrations/callback?status=error&provider=instagram&error=missing_code'
            );
        }

        try {
            $shortLivedTokenData = $this->instagramOAuthService->exchangeCodeForToken($code);
            $longLivedTokenData = $this->instagramOAuthService->exchangeForLongLivedToken($shortLivedTokenData['access_token']);
            $profileData = $this->instagramOAuthService->getUserProfile($longLivedTokenData['access_token']);

            /** @var User $user */
            $user = $this->getUser();

            $existingIntegration = $this->integrationRepository->getByUserAndProviderAndExternalAccountId(
                $user,
                IntegrationProvider::Instagram,
                $profileData['user_id']
            );

            if ($existingIntegration !== null) {
                $integration = $this->instagramOAuthService->updateIntegrationToken($existingIntegration, $longLivedTokenData);
            } else {
                $integration = $this->instagramOAuthService->createIntegration($user, $longLivedTokenData, $profileData);
            }

            $request->getSession()->remove('instagram_oauth_state');
            $request->getSession()->remove('instagram_oauth_user_id');

            return $this->redirect(
                $this->frontendUrl . '/integrations/callback?status=success&provider=instagram&integrationUuid=' . $integration->getUuid()
            );
        } catch (\Exception $e) {
            return $this->redirect(
                $this->frontendUrl . '/integrations/callback?status=error&provider=instagram&error=token_exchange_failed'
            );
        }
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
