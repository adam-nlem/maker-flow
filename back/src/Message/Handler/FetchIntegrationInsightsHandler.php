<?php

namespace App\Message\Handler;

use App\Entity\Enum\IntegrationProvider;
use App\Entity\Enum\IntegrationStatus;
use App\Message\FetchIntegrationInsightsMessage;
use App\Service\IntegrationInsightService;
use App\Repository\IntegrationRepository;
use Psr\Log\LoggerInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler]
class FetchIntegrationInsightsHandler
{
    public function __construct(
        private readonly IntegrationRepository $integrationRepository,
        private readonly IntegrationInsightService $integrationInsightService,
        private LoggerInterface $log,
    ) {
    }

    public function __invoke(FetchIntegrationInsightsMessage $message): void
    {
        $integration = $this->integrationRepository->getByIdAndStatus($message->getIntegrationId(), IntegrationStatus::Active);

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
