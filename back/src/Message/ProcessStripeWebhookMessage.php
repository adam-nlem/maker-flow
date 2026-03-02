<?php

namespace App\Message;

use Symfony\Component\Messenger\Attribute\AsMessage;

#[AsMessage('messages')]
class ProcessStripeWebhookMessage
{
    public function __construct(
        private int $webhookEventId,
    ) {}

    public function getWebhookEventId(): int
    {
        return $this->webhookEventId;
    }
}
