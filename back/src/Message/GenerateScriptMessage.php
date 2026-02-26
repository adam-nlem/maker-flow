<?php

namespace App\Message;

use Symfony\Component\Messenger\Attribute\AsMessage;

#[AsMessage('messages')]
class GenerateScriptMessage
{
    public function __construct(
        private int $scriptGenerationId,
    ) {}

    public function getScriptGenerationId(): int
    {
        return $this->scriptGenerationId;
    }
}
