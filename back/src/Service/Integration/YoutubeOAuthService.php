<?php

namespace App\Service\Integration;

use App\DTO\External\Youtube\YoutubeChannelDTO;
use App\DTO\External\Youtube\YoutubeTokenDTO;
use App\Entity\Enum\Platform;
use App\Entity\Enum\IntegrationStatus;
use App\Entity\Integration;
use App\Entity\Project;
use App\Entity\User;
use App\Event\IntegrationCreatedEvent;
use App\Helper\DateHelper;
use App\Repository\IntegrationRepository;
use App\Service\Integration\Exception\OAuthTokenRevokedException;
use Google\Client;
use Google\Service\YouTube;
use Google\Service\YouTubeAnalytics;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;

class YoutubeOAuthService
{
    public function __construct(
        private readonly Client $googleClient,
        private readonly IntegrationRepository $integrationRepository,
        private readonly EventDispatcherInterface $eventDispatcher,
        private readonly string $youtubeClientId,
        private readonly string $youtubeProjectId,
        private readonly string $youtubeAuthUri,
        private readonly string $youtubeTokenUri,
        private readonly string $youtubeAuthProviderX509CertUrl,
        private readonly string $youtubeClientSecret,
        private readonly string $youtubeRedirectUri,
        private readonly string $youtubeJavascriptOrigin,
    ) {
    }

    public function configureGoogleClient(): void
    {
        $authConfig = [
            "web" => [
                "client_id" => $this->youtubeClientId,
                "project_id" => $this->youtubeProjectId,
                "auth_uri" => $this->youtubeAuthUri,
                "token_uri" => $this->youtubeTokenUri,
                "auth_provider_x509_cert_url" => $this->youtubeAuthProviderX509CertUrl,
                "client_secret" => $this->youtubeClientSecret,
                "redirect_uris" => [
                    $this->youtubeRedirectUri
                ],
                "javascript_origins" => [
                    $this->youtubeJavascriptOrigin
                ],
            ]
        ];

        $this->googleClient->setAuthConfig($authConfig);
        $this->googleClient->setScopes([
            YouTubeAnalytics::YT_ANALYTICS_READONLY,
            YouTube::YOUTUBE_READONLY,
        ]);
        $this->googleClient->setRedirectUri($this->youtubeRedirectUri);
        $this->googleClient->setAccessType('offline');

        // Force the consent screen (Critical to get the refresh token each time during DEV) TODO: Mayber remove this in PROD
        $this->googleClient->setPrompt('consent');
    }

    public function getAuthorizationUrl(string $state): string
    {
        $this->configureGoogleClient();

        $this->googleClient->setState($state);

        return $this->googleClient->createAuthUrl();
    }

    public function getUserChannel(): YoutubeChannelDTO
    {
        $youtube = new YouTube($this->googleClient);
        $response = $youtube->channels->listChannels('snippet', ['mine' => true]);

        $channels = $response->getItems();

        if (empty($channels)) {
            throw new \RuntimeException('No YouTube channel found for this user');
        }

        return YoutubeChannelDTO::fromGoogleChannel($channels[0]);
    }

    public function createIntegration(
        User $user,
        YoutubeTokenDTO $tokenDTO,
        YoutubeChannelDTO $channelData
    ): Integration {
        $expiresAt = DateHelper::createUtcDateTimeImmutable()
            ->modify('+' . $tokenDTO->getExpiresIn() . ' seconds');

        $refreshTokenExpiresAt = null;
        if ($tokenDTO->getRefreshTokenExpiresIn() !== null) {
            $refreshTokenExpiresAt = DateHelper::createUtcDateTimeImmutable()
                ->modify('+' . $tokenDTO->getRefreshTokenExpiresIn() . ' seconds');
        }

        $scopes = array_filter(explode(' ', $tokenDTO->getScope()));

        $integration = new Integration();
        $integration
            ->setUser($user)
            ->setPlatform(Platform::Youtube)
            ->setAccessToken($tokenDTO->getAccessToken())
            ->setRefreshToken($tokenDTO->getRefreshToken())
            ->setAccountId($channelData->getChannelId())
            ->setUserName($channelData->getCustomUrl() ?? $channelData->getChannelId())
            ->setName($channelData->getTitle())
            ->setProfilePictureUrl($channelData->getThumbnailUrl())
            ->setExpiresAt($expiresAt)
            ->setRefreshTokenExpiresAt($refreshTokenExpiresAt)
            ->setLastSyncedAt(DateHelper::createUtcDateTimeImmutable())
            ->setStatus(IntegrationStatus::Active)
            ->setScope($scopes);

        $this->integrationRepository->save($integration);
        return $integration;
    }

    public function updateIntegrationToken(
        Integration $integration,
        YoutubeTokenDTO $tokenDTO
    ): Integration {
        $expiresAt = DateHelper::createUtcDateTimeImmutable()
            ->modify('+' . $tokenDTO->getExpiresIn() . ' seconds');

        $integration
            ->setAccessToken($tokenDTO->getAccessToken())
            ->setExpiresAt($expiresAt)
            ->setLastSyncedAt(DateHelper::createUtcDateTimeImmutable())
            ->setStatus(IntegrationStatus::Active);

        if ($tokenDTO->getRefreshToken() !== null) {
            $integration->setRefreshToken($tokenDTO->getRefreshToken());

            if ($tokenDTO->getRefreshTokenExpiresIn() !== null) {
                $refreshTokenExpiresAt = DateHelper::createUtcDateTimeImmutable()
                    ->modify('+' . $tokenDTO->getRefreshTokenExpiresIn() . ' seconds');
                $integration->setRefreshTokenExpiresAt($refreshTokenExpiresAt);
            }
        }

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

        $refreshThreshold = $expiresAt->modify('-20 minutes');

        if ($now < $refreshThreshold) {
            return $integration;
        }

        $tokenArray = $this->googleClient->fetchAccessTokenWithRefreshToken($integration->getRefreshToken());

        if (isset($tokenArray['error']) && $tokenArray['error'] === 'invalid_grant') {
            $integration->setStatus(IntegrationStatus::Revoked);
            $this->integrationRepository->save($integration, true);

            throw new OAuthTokenRevokedException($integration->getId());
        }
        $tokenDTO = YoutubeTokenDTO::fromArray($tokenArray);

        return $this->updateIntegrationToken($integration, $tokenDTO);
    }

    public function handleCallback(
        string $code,
        User $user,
        Project $project,
    ): Integration {
        $this->configureGoogleClient();

        $tokenArray = $this->googleClient->fetchAccessTokenWithAuthCode($code);
        $tokenDTO = YoutubeTokenDTO::fromArray($tokenArray);

        $this->googleClient->setAccessToken($tokenArray);

        $channelData = $this->getUserChannel();

        $existingIntegration = $this->integrationRepository->getByUserAndPlatformAndAccountId(
            $user,
            Platform::Youtube,
            $channelData->getChannelId()
        );

        if ($existingIntegration !== null) {
            $integration = $this->updateIntegrationToken($existingIntegration, $tokenDTO);
        } else {
            $integration = $this->createIntegration($user, $tokenDTO, $channelData);
        }

        $integration->setProject($project);
        $this->integrationRepository->save($integration, true);

        if ($existingIntegration === null) {
            $this->eventDispatcher->dispatch(new IntegrationCreatedEvent($integration), IntegrationCreatedEvent::NAME);
        }

        return $integration;
    }
}
