<?php

namespace App\Service\Integration;

use App\DTO\External\Tiktok\TiktokTokenDTO;
use App\DTO\External\Tiktok\TiktokUserProfileDTO;
use App\Entity\Enum\Platform;
use App\Entity\Enum\IntegrationStatus;
use App\Entity\Integration;
use App\Entity\Project;
use App\Entity\User;
use App\Event\IntegrationCreatedEvent;
use App\Helper\DateHelper;
use App\Repository\IntegrationRepository;
use App\Exception\Integration\OAuthTokenRevokedException;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class TiktokOAuthService
{
    public function __construct(
        private readonly HttpClientInterface $httpClient,
        private readonly IntegrationRepository $integrationRepository,
        private readonly EventDispatcherInterface $eventDispatcher,

        private readonly string $tiktokAuthorizationUrl,
        private readonly string $tiktokTokenUrl,
        private readonly string $tiktokApiUrl,

        private readonly string $tiktokClientKey,
        private readonly string $tiktokClientSecret,
        private readonly string $tiktokRedirectUri,
    ) {}

    public function getAuthorizationUrl(string $state): string
    {
        $params = [
            'client_key' => $this->tiktokClientKey,
            'response_type' => 'code',
            'scope' => 'user.info.basic,user.info.profile,user.info.stats,video.list',
            'redirect_uri' => $this->tiktokRedirectUri,
            'state' => $state,
        ];

        return sprintf('%s?%s', $this->tiktokAuthorizationUrl, http_build_query($params));
    }

    public function exchangeCodeForToken(string $code): TiktokTokenDTO
    {
        $response = $this->httpClient->request('POST', $this->tiktokTokenUrl, [
            'headers' => [
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Cache-Control' => 'no-cache',
            ],
            'body' => [
                'client_key' => $this->tiktokClientKey,
                'client_secret' => $this->tiktokClientSecret,
                'code' => $code,
                'grant_type' => 'authorization_code',
                'redirect_uri' => $this->tiktokRedirectUri,
            ],
        ]);

        return TiktokTokenDTO::fromArray($response->toArray());
    }

    public function getUserProfile(string $accessToken): TiktokUserProfileDTO
    {
        $response = $this->httpClient->request('GET', sprintf('%s/v2/user/info/', $this->tiktokApiUrl), [
            'headers' => [
                'Authorization' => sprintf('Bearer %s', $accessToken),
            ],
            'query' => [
                'fields' => 'open_id,display_name,avatar_url,username',
            ],
        ]);

        return TiktokUserProfileDTO::fromArray($response->toArray());
    }

    public function createIntegration(User $user, TiktokTokenDTO $tokenDTO, TiktokUserProfileDTO $userProfile): Integration
    {
        $expiresAt = DateHelper::createUtcDateTimeImmutable()
            ->modify('+' . $tokenDTO->getExpiresIn() . ' seconds');

        $refreshTokenExpiresAt = DateHelper::createUtcDateTimeImmutable()
            ->modify('+' . $tokenDTO->getRefreshExpiresIn() . ' seconds');

        $scopes = array_filter(explode(',', $tokenDTO->getScope()));

        $integration = new Integration();
        $integration
            ->setCreatedBy($user)
            ->setPlatform(Platform::Tiktok)
            ->setAccessToken($tokenDTO->getAccessToken())
            ->setRefreshToken($tokenDTO->getRefreshToken())
            ->setAccountId($tokenDTO->getOpenId())
            ->setUserName($userProfile->getUsername() ?? $tokenDTO->getOpenId())
            ->setName($userProfile->getDisplayName())
            ->setProfilePictureUrl($userProfile->getAvatarUrl())
            ->setExpiresAt($expiresAt)
            ->setRefreshTokenExpiresAt($refreshTokenExpiresAt)
            ->setLastSyncedAt(DateHelper::createUtcDateTimeImmutable())
            ->setStatus(IntegrationStatus::Active)
            ->setScope($scopes);

        $this->integrationRepository->save($integration);

        return $integration;
    }

    public function updateIntegrationToken(Integration $integration, TiktokTokenDTO $tokenDTO): Integration
    {
        $expiresAt = DateHelper::createUtcDateTimeImmutable()
            ->modify('+' . $tokenDTO->getExpiresIn() . ' seconds');

        $integration
            ->setAccessToken($tokenDTO->getAccessToken())
            ->setRefreshToken($tokenDTO->getRefreshToken())
            ->setExpiresAt($expiresAt)
            ->setLastSyncedAt(DateHelper::createUtcDateTimeImmutable())
            ->setStatus(IntegrationStatus::Active);

        if ($tokenDTO->getRefreshExpiresIn() > 0) {
            $refreshTokenExpiresAt = DateHelper::createUtcDateTimeImmutable()
                ->modify('+' . $tokenDTO->getRefreshExpiresIn() . ' seconds');
            $integration->setRefreshTokenExpiresAt($refreshTokenExpiresAt);
        }

        $this->integrationRepository->save($integration);

        return $integration;
    }

    public function refreshToken(string $refreshToken): TiktokTokenDTO
    {
        $response = $this->httpClient->request('POST', $this->tiktokTokenUrl, [
            'headers' => [
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Cache-Control' => 'no-cache',
            ],
            'body' => [
                'client_key' => $this->tiktokClientKey,
                'client_secret' => $this->tiktokClientSecret,
                'grant_type' => 'refresh_token',
                'refresh_token' => $refreshToken,
            ],
        ]);

        return TiktokTokenDTO::fromArray($response->toArray());
    }

    public function refreshTokenIfNeeded(Integration $integration): Integration
    {
        $now = DateHelper::createUtcDateTimeImmutable();
        $expiresAt = $integration->getExpiresAt();

        if ($expiresAt === null) {
            return $integration;
        }

        $refreshThreshold = $expiresAt->modify('-1 hour');

        if ($now < $refreshThreshold) {
            return $integration;
        }

        try {
            $newToken = $this->refreshToken($integration->getRefreshToken());
        } catch (ClientExceptionInterface $e) {
            $integration->setStatus(IntegrationStatus::Revoked);
            $this->integrationRepository->save($integration, true);

            throw new OAuthTokenRevokedException($integration->getUuid());
        }

        return $this->updateIntegrationToken($integration, $newToken);
    }

    public function handleCallback(string $code, User $user, Project $project): Integration
    {
        $tokenDTO = $this->exchangeCodeForToken($code);
        $userProfile = $this->getUserProfile($tokenDTO->getAccessToken());

        $existingIntegration = $this->integrationRepository->getByAgencyAndPlatformAndAccountId(
            $project->getAgency(),
            Platform::Tiktok,
            $tokenDTO->getOpenId()
        );

        if ($existingIntegration !== null) {
            $integration = $this->updateIntegrationToken($existingIntegration, $tokenDTO);
        } else {
            $integration = $this->createIntegration($user, $tokenDTO, $userProfile);
        }

        $integration->setProject($project);
        $this->integrationRepository->save($integration, true);

        if ($existingIntegration === null) {
            $this->eventDispatcher->dispatch(new IntegrationCreatedEvent($integration), IntegrationCreatedEvent::NAME);
        }

        return $integration;
    }
}
