<?php

namespace App\Message\Handler;

use App\Message\ProcessStripeWebhookMessage;
use App\Repository\StripeWebhookEventRepository;
use App\Service\Stripe\StripeWebhookService;
use Psr\Log\LoggerInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler]
class ProcessStripeWebhookHandler
{
    public function __construct(
        private readonly StripeWebhookEventRepository $webhookEventRepository,
        private readonly StripeWebhookService $stripeWebhookService,
        private readonly LoggerInterface $log,
    ) {}

    public function __invoke(ProcessStripeWebhookMessage $message): void
    {
        $event = $this->webhookEventRepository->getById($message->getWebhookEventId());

        if ($event === null) {
            return;
        }

        try {
            $this->stripeWebhookService->processEvent($event);
        } catch (\Exception $e) {
            $this->log->error('Stripe webhook processing failed', [
                'eventId' => $event->getStripeEventId(),
                'eventType' => $event->getEventType()->value,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
