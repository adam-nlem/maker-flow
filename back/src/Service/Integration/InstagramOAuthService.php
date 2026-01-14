<?php

namespace App\Service\Integration;

use App\Entity\Enum\IntegrationProvider;
use App\Entity\Enum\IntegrationStatus;
use App\Entity\Integration;
use App\Entity\User;
use App\Helper\DateHelper;
use App\Repository\IntegrationRepository;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class InstagramOAuthService
{
    private const AUTHORIZATION_URL = 'https://www.instagram.com/oauth/authorize';
    private const TOKEN_URL = 'https://api.instagram.com/oauth/access_token';
    private const GRAPH_URL = 'https://graph.instagram.com';

    public function __construct(
        private readonly HttpClientInterface $httpClient,
        private readonly IntegrationRepository $integrationRepository,
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

        return self::AUTHORIZATION_URL . '?' . http_build_query($params);
    }

    public function exchangeCodeForToken(string $code): array
    {
        $response = $this->httpClient->request('POST', self::TOKEN_URL, [
            'body' => [
                'client_id' => $this->instagramAppId,
                'client_secret' => $this->instagramAppSecret,
                'grant_type' => 'authorization_code',
                'redirect_uri' => $this->instagramRedirectUri,
                'code' => $code,
            ],
        ]);

        return $response->toArray();
    }

    public function exchangeForLongLivedToken(string $shortLivedToken): array
    {
        $response = $this->httpClient->request('GET', self::GRAPH_URL . '/access_token', [
            'query' => [
                'grant_type' => 'ig_exchange_token',
                'client_secret' => $this->instagramAppSecret,
                'access_token' => $shortLivedToken,
            ],
        ]);

        return $response->toArray();
    }

    public function refreshToken(string $longLivedToken): array
    {
        $response = $this->httpClient->request('GET', self::GRAPH_URL . '/refresh_access_token', [
            'query' => [
                'grant_type' => 'ig_refresh_token',
                'access_token' => $longLivedToken,
            ],
        ]);

        return $response->toArray();
    }

    public function getUserProfile(string $accessToken): array
    {
        $response = $this->httpClient->request('GET', self::GRAPH_URL . '/me', [
            'query' => [
                'fields' => 'user_id,username,name,profile_picture_url,account_type',
                'access_token' => $accessToken,
            ],
        ]);

        return $response->toArray();
    }

    public function createIntegration(User $user, array $tokenData, array $profileData): Integration
    {
        $expiresAt = DateHelper::createUtcDateTimeImmutable()
            ->modify('+' . ($tokenData['expires_in'] ?? 5184000) . ' seconds');

        $integration = new Integration();
        $integration
            ->setUser($user)
            ->setProvider(IntegrationProvider::Instagram)
            ->setAccessToken($tokenData['access_token'])
            ->setExternalAccountId($profileData['user_id'])
            ->setExternalAccountName($profileData['username'])
            ->setExpiresAt($expiresAt)
            ->setLastSyncedAt(DateHelper::createUtcDateTimeImmutable())
            ->setStatus(IntegrationStatus::Active)
            ->setScope(['instagram_business_basic', 'instagram_business_manage_messages', 'instagram_business_manage_comments', 'instagram_business_content_publish']);

        $this->integrationRepository->save($integration, true);

        return $integration;
    }

    public function updateIntegrationToken(Integration $integration, array $tokenData): Integration
    {
        $expiresAt = DateHelper::createUtcDateTimeImmutable()
            ->modify('+' . ($tokenData['expires_in'] ?? 5184000) . ' seconds');

        $integration
            ->setAccessToken($tokenData['access_token'])
            ->setExpiresAt($expiresAt)
            ->setLastSyncedAt(DateHelper::createUtcDateTimeImmutable())
            ->setStatus(IntegrationStatus::Active);

        $this->integrationRepository->save($integration, true);

        return $integration;
    }
}
