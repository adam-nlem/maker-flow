<?php

namespace App\Message;

use Symfony\Component\Messenger\Attribute\AsMessage;

#[AsMessage('messages')]
class ProcessPostDraftVideoMessage
{
    public function __construct(
        private int $mediaVersionId,
    ) {}

    public function getMediaVersionId(): int
    {
        return $this->mediaVersionId;
    }
}
