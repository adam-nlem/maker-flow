<?php

namespace App\EventSubscriber;

use App\Event\IntegrationTokenExpiredEvent;
use App\Message\SendEmailMessage;
use App\Service\Mailing\Template\IntegrationTokenExpiredEmailTemplate;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Messenger\MessageBusInterface;

class IntegrationTokenExpiredSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly MessageBusInterface $messageBus,
        private readonly string $frontendUrl,
    ) {}

    public static function getSubscribedEvents(): array
    {
        return [
            IntegrationTokenExpiredEvent::NAME => 'onIntegrationTokenExpired',
        ];
    }

    public function onIntegrationTokenExpired(IntegrationTokenExpiredEvent $event): void
    {
        $integration = $event->getIntegration();
        $user = $integration->getUser();

        $template = new IntegrationTokenExpiredEmailTemplate(
            $user->getEmail(),
            $user->getFirstName(),
            ucfirst($integration->getPlatform()->value),
            $integration->getUserName(),
            $this->frontendUrl . '/settings/integrations',
        );

        $this->messageBus->dispatch(new SendEmailMessage($template));
    }
}
