<?php

namespace App\Service\Integration;

use App\Entity\Integration;
use App\Entity\User;
use App\Entity\UserModule;
use App\Repository\IntegrationRepository;
use App\Repository\UserModuleRepository;
use Google\Client;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Google\Service\YouTubeAnalytics;

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

    // The Google Client should be configured for each request because it is not persistant
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
        $this->googleClient->setScopes([YouTubeAnalytics::YT_ANALYTICS_READONLY]);
        $this->googleClient->setRedirectUri($this->youtubeRedirectUri);
        $this->googleClient->setAccessType('offline');
    }

    public function getAuthorizationUrl(string $state): string
    {
        $this->configureClient();

        $this->googleClient->setState($state);

        return $this->googleClient->createAuthUrl();
    }

    public function handleCallback(
        string $code,
        User $user,
        UserModule $userModule,
    ): Integration {
        $this->configureClient();

        $accessToken = $this->googleClient->fetchAccessTokenWithAuthCode($code);

        dd($accessToken);
    }
}
