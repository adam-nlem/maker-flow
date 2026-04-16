<?php

namespace App\Message\Handler;

use App\Entity\Enum\Platform;
use App\Entity\Enum\IntegrationStatus;
use App\Event\IntegrationTokenExpiredEvent;
use App\Message\FetchIntegrationInsightsMessage;
use App\Service\IntegrationInsight\IntegrationInsightService;
use App\Exception\Integration\OAuthTokenRevokedException;
use App\Repository\IntegrationRepository;
use Psr\Log\LoggerInterface;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

use function Sentry\captureException;

#[AsMessageHandler]
class FetchIntegrationInsightsHandler
{
    public function __construct(
        private readonly IntegrationRepository $integrationRepository,
        private readonly IntegrationInsightService $integrationInsightService,
        private readonly EventDispatcherInterface $eventDispatcher,
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
            match ($integration->getPlatform()) {
                Platform::Instagram => $this->integrationInsightService->fetchInstagramProfileInsights($integration),
                Platform::Youtube => $this->integrationInsightService->fetchYoutubeProfileInsights($integration),
                Platform::Tiktok => $this->integrationInsightService->fetchTiktokProfileInsights($integration),
                default => null,
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
