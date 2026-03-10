<?php

namespace App\Message\Handler;

use App\Entity\Enum\Platform;
use App\Entity\Enum\IntegrationStatus;
use App\Event\IntegrationTokenExpiredEvent;
use App\Message\FetchPostInsightsMessage;
use App\Service\PostInsight\PostInsightService;
use App\Service\Integration\Exception\OAuthTokenRevokedException;
use App\Repository\IntegrationRepository;
use Psr\Log\LoggerInterface;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

use function Sentry\captureException;

#[AsMessageHandler]
class FetchPostInsightsHandler
{
    public function __construct(
        private readonly IntegrationRepository $integrationRepository,
        private readonly PostInsightService $postInsightService,
        private readonly EventDispatcherInterface $eventDispatcher,
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
        } catch (OAuthTokenRevokedException $e) {
            $this->eventDispatcher->dispatch(
                new IntegrationTokenExpiredEvent($integration),
                IntegrationTokenExpiredEvent::NAME
            );
        } catch (\Exception $e) {
            captureException($e);
        }
    }
}
