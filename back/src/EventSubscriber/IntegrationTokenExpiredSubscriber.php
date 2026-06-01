<?php

namespace App\EventSubscriber;

use App\Entity\Enum\UserRole;
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
        $agency = $integration->getProject()?->getAgency();

        if ($agency === null) {
            return;
        }

        foreach ($agency->getCollaborators() as $collaborator) {
            if (!$collaborator->hasRole(UserRole::Editor) && !$collaborator->hasRole(UserRole::Admin)) {
                continue;
            }

            $template = new IntegrationTokenExpiredEmailTemplate(
                $collaborator->getEmail(),
                $collaborator->getFirstName(),
                ucfirst($integration->getPlatform()->value),
                $integration->getUserName(),
                $this->frontendUrl . '/settings/integrations',
            );

            $this->messageBus->dispatch(new SendEmailMessage($template));
        }
    }
}
