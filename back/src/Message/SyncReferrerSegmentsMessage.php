<?php

namespace App\Message;

use Symfony\Component\Messenger\Attribute\AsMessage;

#[AsMessage('messages')]
class SyncReferrerSegmentsMessage
{
    public function __construct(
        private readonly int $referrerId,
    ) {}

    public function getReferrerId(): int
    {
        return $this->referrerId;
    }
}
