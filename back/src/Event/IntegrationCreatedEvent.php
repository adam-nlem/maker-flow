<?php

namespace App\Event;

use App\Entity\Integration;
use Symfony\Contracts\EventDispatcher\Event;

class IntegrationCreatedEvent extends Event
{
    public const NAME = 'integration.created';

    public function __construct(
        private readonly Integration $integration,
    ) {}

    public function getIntegration(): Integration
    {
        return $this->integration;
    }
}
