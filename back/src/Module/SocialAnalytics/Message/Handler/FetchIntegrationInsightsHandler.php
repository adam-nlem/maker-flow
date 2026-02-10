<?php

namespace App\Module\SocialAnalytics\Message\Handler;

use App\Entity\Enum\IntegrationProvider;
use App\Module\SocialAnalytics\Message\FetchIntegrationInsightsMessage;
use App\Module\SocialAnalytics\Service\SocialAnalyticsIntegrationInsightService;
use App\Repository\IntegrationRepository;
use Psr\Log\LoggerInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler]
class FetchIntegrationInsightsHandler
{
    public function __construct(
        private readonly IntegrationRepository $integrationRepository,
        private readonly SocialAnalyticsIntegrationInsightService $integrationInsightService,
        private LoggerInterface $log,
    ) {
    }

    public function __invoke(FetchIntegrationInsightsMessage $message): void
    {
        $integration = $this->integrationRepository->getById($message->getIntegrationId());

        if ($integration === null) {
            return;
        }
        try {


            match ($integration->getProvider()) {
                IntegrationProvider::Instagram => $this->integrationInsightService->fetchInstagramProfileInsights($integration),
                IntegrationProvider::Youtube => $this->integrationInsightService->fetchYoutubeProfileInsights($integration),
            };

        } catch (\Exception $e) {
            $this->log->error($e);
        }
    }
}
