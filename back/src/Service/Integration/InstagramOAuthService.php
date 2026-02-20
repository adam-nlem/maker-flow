<?php

namespace App\Service\Integration;

use App\DTO\External\Instagram\InstagramTokenDTO;
use App\DTO\External\Instagram\InstagramUserProfileDTO;
use App\Entity\Enum\IntegrationProvider;
use App\Entity\Enum\IntegrationStatus;
use App\Entity\Integration;
use App\Entity\Project;
use App\Entity\User;
use App\Event\IntegrationCreatedEvent;
use App\Helper\DateHelper;
use App\Repository\IntegrationRepository;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use App\Service\Integration\Exception\OAuthTokenRevokedException;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class InstagramOAuthService
{

    public function __construct(
        private readonly HttpClientInterface $httpClient,
        private readonly IntegrationRepository $integrationRepository,
        private readonly EventDispatcherInterface $eventDispatcher,


        private readonly string $instagramGraphUrl,
        private readonly string $instagramAuthorizationUrl,
        private readonly string $instagramTokenUrl,

        private readonly string $instagramAppId,
        private readonly string $instagramAppSecret,
        private readonly string $instagramRedirectUri,
    ) {}

    public function getAuthorizationUrl(string $state): string
    {
        $params = [
            'client_id' => $this->instagramAppId,
            'redirect_uri' => $this->instagramRedirectUri,
            'response_type' => 'code',
            'scope' => 'instagram_business_basic,instagram_business_manage_insights',
            'state' => $state,
        ];

        return sprintf('%s?%s', $this->instagramAuthorizationUrl, http_build_query($params));
    }

    public function exchangeCodeForToken(string $code): InstagramTokenDTO
    {
        $response = $this->httpClient->request('POST', $this->instagramTokenUrl, [
            'body' => [
                'client_id' => $this->instagramAppId,
                'client_secret' => $this->instagramAppSecret,
                'grant_type' => 'authorization_code',
                'redirect_uri' => $this->instagramRedirectUri,
                'code' => $code,
            ],
        ]);

        return InstagramTokenDTO::fromArray($response->toArray());
    }

    public function exchangeForLongLivedToken(string $shortLivedToken): InstagramTokenDTO
    {
        $response = $this->httpClient->request('GET', sprintf('%s/access_token', $this->instagramGraphUrl), [
            'query' => [
                'grant_type' => 'ig_exchange_token',
                'client_secret' => $this->instagramAppSecret,
                'access_token' => $shortLivedToken,
            ],
        ]);

        return InstagramTokenDTO::fromArray($response->toArray());
    }

    public function refreshToken(string $longLivedToken): InstagramTokenDTO
    {
        $response = $this->httpClient->request('GET', sprintf('%s/refresh_access_token', $this->instagramGraphUrl), [
            'query' => [
                'grant_type' => 'ig_refresh_token',
                'access_token' => $longLivedToken,
            ],
        ]);

        return InstagramTokenDTO::fromArray($response->toArray());
    }

    public function getUserProfile(string $accessToken): InstagramUserProfileDTO
    {
        $response = $this->httpClient->request('GET', sprintf('%s/me', $this->instagramGraphUrl), [
            'query' => [
                'fields' => 'user_id,username,name,profile_picture_url,account_type',
                'access_token' => $accessToken,
            ],
        ]);

        return InstagramUserProfileDTO::fromArray($response->toArray());
    }

    public function createIntegration(User $user, InstagramTokenDTO $tokenDTO, InstagramUserProfileDTO $instagramUserProfile): Integration
    {
        $expiresAt = DateHelper::createUtcDateTimeImmutable()
            ->modify('+' . $tokenDTO->getExpiresIn() . ' seconds');

        $integration = new Integration();
        $integration
            ->setUser($user)
            ->setProvider(IntegrationProvider::Instagram)
            ->setAccessToken($tokenDTO->getAccessToken())
            ->setAccountId($instagramUserProfile->getUserId())
            ->setUserName($instagramUserProfile->getUsername())
            ->setName($instagramUserProfile->getName())
            ->setProfilePictureUrl($instagramUserProfile->getProfilePictureUrl())
            ->setExpiresAt($expiresAt)
            ->setLastSyncedAt(DateHelper::createUtcDateTimeImmutable())
            ->setStatus(IntegrationStatus::Active)
            ->setScope(['instagram_business_basic', 'instagram_business_manage_messages', 'instagram_business_manage_comments', 'instagram_business_content_publish']);

        $this->integrationRepository->save($integration);

        return $integration;
    }

    public function updateIntegrationToken(Integration $integration, InstagramTokenDTO $tokenDTO): Integration
    {
        $expiresAt = DateHelper::createUtcDateTimeImmutable()
            ->modify('+' . $tokenDTO->getExpiresIn() . ' seconds');

        $integration
            ->setAccessToken($tokenDTO->getAccessToken())
            ->setExpiresAt($expiresAt)
            ->setLastSyncedAt(DateHelper::createUtcDateTimeImmutable())
            ->setStatus(IntegrationStatus::Active);

        $this->integrationRepository->save($integration);

        return $integration;
    }

    public function refreshTokenIfNeeded(Integration $integration): Integration
    {
        $now = DateHelper::createUtcDateTimeImmutable();
        $expiresAt = $integration->getExpiresAt();

        if ($expiresAt === null) {
            return $integration;
        }

        $refreshThreshold = $expiresAt->modify('-7 days');

        if ($now < $refreshThreshold) {
            return $integration;
        }

        try {
            $newToken = $this->refreshToken($integration->getAccessToken());
        } catch (ClientExceptionInterface $e) {
            $integration->setStatus(IntegrationStatus::Revoked);
            $this->integrationRepository->save($integration, true);

            throw new OAuthTokenRevokedException($integration->getId());
        }

        return $this->updateIntegrationToken($integration, $newToken);
    }

    public function handleCallback(string $code, User $user, Project $project): Integration
    {
        $shortLivedToken = $this->exchangeCodeForToken($code);
        $longLivedToken = $this->exchangeForLongLivedToken($shortLivedToken->getAccessToken());
        $instagramUserProfile = $this->getUserProfile($longLivedToken->getAccessToken());

        $existingIntegration = $this->integrationRepository->getByUserAndProviderAndAccountId(
            $user,
            IntegrationProvider::Instagram,
            $instagramUserProfile->getUserId()
        );

        if ($existingIntegration !== null) {
            $integration = $this->updateIntegrationToken($existingIntegration, $longLivedToken);
        } else {
            $integration = $this->createIntegration($user, $longLivedToken, $instagramUserProfile);
        }

        $integration->setProject($project);
        $this->integrationRepository->save($integration, true);

        if ($existingIntegration === null) {
            $this->eventDispatcher->dispatch(new IntegrationCreatedEvent($integration), IntegrationCreatedEvent::NAME);
        }

        return $integration;
    }
}
