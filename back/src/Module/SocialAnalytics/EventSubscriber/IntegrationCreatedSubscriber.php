<?php

namespace App\Module\SocialAnalytics\EventSubscriber;

use App\Entity\Enum\IntegrationProvider;
use App\Event\IntegrationCreatedEvent;
use App\Module\SocialAnalytics\Message\FetchIntegrationInsightsMessage;
use App\Module\SocialAnalytics\Message\FetchPostInsightsMessage;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Messenger\MessageBusInterface;

class IntegrationCreatedSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly MessageBusInterface $bus,
    ) {}

    public static function getSubscribedEvents(): array
    {
        return [
            IntegrationCreatedEvent::NAME => 'onIntegrationCreated',
        ];
    }

    public function onIntegrationCreated(IntegrationCreatedEvent $event): void
    {
        $integration = $event->getIntegration();

        $this->bus->dispatch(new FetchIntegrationInsightsMessage($integration->getId()));
        $this->bus->dispatch(new FetchPostInsightsMessage($integration->getId()));
    }
}
