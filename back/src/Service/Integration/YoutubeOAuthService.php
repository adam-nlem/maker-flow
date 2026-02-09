<?php

namespace App\Service\Integration;

use App\DTO\External\Youtube\YoutubeChannelDTO;
use App\DTO\External\Youtube\YoutubeTokenDTO;
use App\Entity\Enum\IntegrationProvider;
use App\Entity\Enum\IntegrationStatus;
use App\Entity\Integration;
use App\Entity\User;
use App\Entity\UserModule;
use App\Event\IntegrationCreatedEvent;
use App\Helper\DateHelper;
use App\Repository\IntegrationRepository;
use App\Repository\UserModuleRepository;
use Google\Client;
use Google\Service\YouTube;
use Google\Service\YouTubeAnalytics;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;

class YoutubeOAuthService
{
    public function __construct(
        private readonly Client $googleClient,
        private readonly IntegrationRepository $integrationRepository,
        private readonly UserModuleRepository $userModuleRepository,
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

    private function configureClient(): void
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
    }

    public function getAuthorizationUrl(string $state): string
    {
        $this->configureClient();

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
        YoutubeTokenDTO $tokenData,
        YoutubeChannelDTO $channelData
    ): Integration {
        $expiresAt = DateHelper::createUtcDateTimeImmutable()
            ->modify('+' . $tokenData->getExpiresIn() . ' seconds');

        $refreshTokenExpiresAt = null;
        if ($tokenData->getRefreshTokenExpiresIn() !== null) {
            $refreshTokenExpiresAt = DateHelper::createUtcDateTimeImmutable()
                ->modify('+' . $tokenData->getRefreshTokenExpiresIn() . ' seconds');
        }

        $scopes = array_filter(explode(' ', $tokenData->getScope()));

        $integration = new Integration();
        $integration
            ->setUser($user)
            ->setProvider(IntegrationProvider::Youtube)
            ->setAccessToken($tokenData->getAccessToken())
            ->setRefreshToken($tokenData->getRefreshToken())
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
        YoutubeTokenDTO $tokenData
    ): Integration {
        $expiresAt = DateHelper::createUtcDateTimeImmutable()
            ->modify('+' . $tokenData->getExpiresIn() . ' seconds');

        $integration
            ->setAccessToken($tokenData->getAccessToken())
            ->setExpiresAt($expiresAt)
            ->setLastSyncedAt(DateHelper::createUtcDateTimeImmutable())
            ->setStatus(IntegrationStatus::Active);

        if ($tokenData->getRefreshToken() !== null) {
            $integration->setRefreshToken($tokenData->getRefreshToken());

            if ($tokenData->getRefreshTokenExpiresIn() !== null) {
                $refreshTokenExpiresAt = DateHelper::createUtcDateTimeImmutable()
                    ->modify('+' . $tokenData->getRefreshTokenExpiresIn() . ' seconds');
                $integration->setRefreshTokenExpiresAt($refreshTokenExpiresAt);
            }
        }

        $this->integrationRepository->save($integration);

        return $integration;
    }

    public function handleCallback(
        string $code,
        User $user,
        UserModule $userModule,
    ): Integration {
        $this->configureClient();

        $tokenArray = $this->googleClient->fetchAccessTokenWithAuthCode($code);
        $tokenData = YoutubeTokenDTO::fromArray($tokenArray);

        $this->googleClient->setAccessToken($tokenArray);

        $channelData = $this->getUserChannel();

        $existingIntegration = $this->integrationRepository->getByUserAndProviderAndAccountId(
            $user,
            IntegrationProvider::Youtube,
            $channelData->getChannelId()
        );

        if ($existingIntegration !== null) {
            $integration = $this->updateIntegrationToken($existingIntegration, $tokenData);
        } else {
            $integration = $this->createIntegration($user, $tokenData, $channelData);
        }

        $userModule->addIntegration($integration);
        $this->userModuleRepository->save($userModule, true);

        if ($existingIntegration === null) {
            $this->eventDispatcher->dispatch(new IntegrationCreatedEvent($integration), IntegrationCreatedEvent::NAME);
        }

        return $integration;
    }
}
