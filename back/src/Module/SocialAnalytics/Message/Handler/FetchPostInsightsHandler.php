<?php

namespace App\Module\SocialAnalytics\Message\Handler;

use App\Module\SocialAnalytics\Message\FetchPostInsightsMessage;
use App\Module\SocialAnalytics\Service\SocialAnalyticsPostInsightService;
use App\Repository\IntegrationRepository;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler]
class FetchPostInsightsHandler
{
    public function __construct(
        private readonly IntegrationRepository $integrationRepository,
        private readonly SocialAnalyticsPostInsightService $postInsightService,
    ) {}

    public function __invoke(FetchPostInsightsMessage $message): void
    {
        $integration = $this->integrationRepository->getById($message->getIntegrationId());

        if ($integration === null) {
            return;
        }

        $this->postInsightService->fetchInstagramPostInsights($integration);
    }
}
