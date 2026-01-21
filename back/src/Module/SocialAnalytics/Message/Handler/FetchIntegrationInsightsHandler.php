<?php

namespace App\Module\SocialAnalytics\Message\Handler;

use App\Module\SocialAnalytics\Message\FetchIntegrationInsightsMessage;
use App\Module\SocialAnalytics\Service\SocialAnalyticsIntegrationInsightService;
use App\Repository\IntegrationRepository;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler]
class FetchIntegrationInsightsHandler
{
    public function __construct(
        private readonly IntegrationRepository $integrationRepository,
        private readonly SocialAnalyticsIntegrationInsightService $integrationInsightService,
    ) {}

    public function __invoke(FetchIntegrationInsightsMessage $message): void
    {
        $integration = $this->integrationRepository->getById($message->getIntegrationId());

        if ($integration === null) {
            return;
        }

        $this->integrationInsightService->fetchInstagramProfileInsights($integration);
    }
}