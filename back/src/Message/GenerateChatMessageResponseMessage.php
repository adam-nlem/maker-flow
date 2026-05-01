<?php

namespace App\Message;

use Symfony\Component\Messenger\Attribute\AsMessage;

#[AsMessage('messages')]
class GenerateChatMessageResponseMessage
{
    public function __construct(
        private int $messageId,
        private int $retryCount = 0,
        private int $debitedFromSubscription = 0,
        private int $debitedFromRefill = 0,
    ) {}

    public function getMessageId(): int
    {
        return $this->messageId;
    }

    public function getRetryCount(): int
    {
        return $this->retryCount;
    }

    public function getDebitedFromSubscription(): int
    {
        return $this->debitedFromSubscription;
    }

    public function getDebitedFromRefill(): int
    {
        return $this->debitedFromRefill;
    }
}
