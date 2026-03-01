<?php

namespace App\Message;

use Symfony\Component\Messenger\Attribute\AsMessage;

#[AsMessage('messages')]
class GenerateScriptMessage
{
    public function __construct(
        private int $scriptGenerationId,
        private int $retryCount = 0,
    ) {}

    public function getScriptGenerationId(): int
    {
        return $this->scriptGenerationId;
    }

    public function getRetryCount(): int
    {
        return $this->retryCount;
    }
}
