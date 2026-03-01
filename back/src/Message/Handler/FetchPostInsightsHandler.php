<?php

namespace App\Message\Handler;

use App\Entity\Enum\Platform;
use App\Entity\Enum\IntegrationStatus;
use App\Message\FetchPostInsightsMessage;
use App\Service\PostInsight\PostInsightService;
use App\Repository\IntegrationRepository;
use Psr\Log\LoggerInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler]
class FetchPostInsightsHandler
{
    public function __construct(
        private readonly IntegrationRepository $integrationRepository,
        private readonly PostInsightService $postInsightService,
        private LoggerInterface $log,
    ) {}

    public function __invoke(FetchPostInsightsMessage $message): void
    {
        $integration = $this->integrationRepository->getByIdAndStatus(
            $message->getIntegrationId(),
            IntegrationStatus::Active
        );

        if ($integration === null) {
            return;
        }

        try {
            match ($integration->getPlatform()) {
                Platform::Instagram => $this->postInsightService->fetchInstagramPostInsights($integration),
                Platform::Youtube => $this->postInsightService->fetchYoutubePostInsights($integration),
            };
        } catch (\Exception $e) {
            $this->log->error($e);
        }
    }
}
