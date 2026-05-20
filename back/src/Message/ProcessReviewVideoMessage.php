<?php

namespace App\Message;

use Symfony\Component\Messenger\Attribute\AsMessage;

#[AsMessage('messages')]
class ProcessReviewVideoMessage
{
    public function __construct(
        private int $reviewVersionId,
    ) {}

    public function getReviewVersionId(): int
    {
        return $this->reviewVersionId;
    }
}
