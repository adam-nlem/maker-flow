<?php

namespace App\Message;

use Symfony\Component\Messenger\Attribute\AsMessage;

#[AsMessage('messages')]
class FetchPostInsightsMessage
{
    public function __construct(
        private int $integrationId,
    ) {}

    public function getIntegrationId(): int
    {
        return $this->integrationId;
    }
}
