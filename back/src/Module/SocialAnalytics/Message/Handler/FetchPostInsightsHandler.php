<?php

namespace App\Module\SocialAnalytics\Message\Handler;

use App\Entity\Enum\IntegrationProvider;
use App\Module\SocialAnalytics\Message\FetchPostInsightsMessage;
use App\Module\SocialAnalytics\Service\SocialAnalyticsPostInsightService;
use App\Repository\IntegrationRepository;
use Psr\Log\LoggerInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler]
class FetchPostInsightsHandler
{
    public function __construct(
        private readonly IntegrationRepository $integrationRepository,
        private readonly SocialAnalyticsPostInsightService $postInsightService,
        private LoggerInterface $log,
    ) {}

    public function __invoke(FetchPostInsightsMessage $message): void
    {
        $integration = $this->integrationRepository->getById($message->getIntegrationId());

        if ($integration === null) {
            return;
        }

        try {
            match ($integration->getProvider()) {
                IntegrationProvider::Instagram => $this->postInsightService->fetchInstagramPostInsights($integration),
                IntegrationProvider::Youtube => $this->postInsightService->fetchYoutubePostInsights($integration),
            };
        } catch (\Exception $e) {
            $this->log->error($e);
        }
    }
}
