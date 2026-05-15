<?php

namespace App\Message;

use Symfony\Component\Messenger\Attribute\AsMessage;

#[AsMessage('messages')]
class OptimizePostDraftRevisionMessage
{
    public function __construct(
        private int $revisionId,
    ) {}

    public function getRevisionId(): int
    {
        return $this->revisionId;
    }
}
