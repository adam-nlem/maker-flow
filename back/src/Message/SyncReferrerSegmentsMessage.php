<?php

namespace App\Message;

use Symfony\Component\Messenger\Attribute\AsMessage;

#[AsMessage('messages')]
class SyncReferrerSegmentsMessage
{
    public function __construct(
        private readonly int $referrerId,
        private readonly int $retryCount = 0,
    ) {}

    public function getReferrerId(): int
    {
        return $this->referrerId;
    }

    public function getRetryCount(): int
    {
        return $this->retryCount;
    }
}
