<?php

namespace App\EventSubscriber;

use App\Entity\User;
use Sentry\State\HubInterface;
use Sentry\State\Scope;
use Sentry\UserDataBag;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

use function Sentry\configureScope;

final class SentryUserContextSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly HubInterface $hub,
        private readonly Security $security,
    ) {}

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::REQUEST => ['onKernelRequest', 0],
        ];
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        /** @var User|null $user */
        $user = $this->security->getUser();

        if ($user === null) {
            return;
        }

        configureScope(function (Scope $scope) use ($user): void {
            $scope->setUser(new UserDataBag(
                id: $user->getUuid(),
                email: $user->getEmail(),
            ));
        });
    }
}
