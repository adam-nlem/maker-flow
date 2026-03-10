<?php

namespace App\Event;

use App\Entity\Integration;
use Symfony\Contracts\EventDispatcher\Event;

class IntegrationTokenExpiredEvent extends Event
{
    public const NAME = 'integration.token_expired';

    public function __construct(
        private readonly Integration $integration,
    ) {}

    public function getIntegration(): Integration
    {
        return $this->integration;
    }
}
