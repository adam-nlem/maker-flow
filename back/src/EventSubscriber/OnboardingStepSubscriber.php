<?php

namespace App\EventSubscriber;

use App\Entity\Enum\OnboardingStep;
use App\Event\IntegrationCreatedEvent;
use App\Service\OnboardingService;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

use function Sentry\captureException;

class OnboardingStepSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly OnboardingService $onboardingService,
    ) {}

    public static function getSubscribedEvents(): array
    {
        return [
            IntegrationCreatedEvent::NAME => 'onIntegrationCreated',
        ];
    }

    public function onIntegrationCreated(IntegrationCreatedEvent $event): void
    {
        try {
            $user = $event->getIntegration()->getUser();
            $onboarding = $this->onboardingService->getOrCreateOnboarding($user);
            $this->onboardingService->completeStep($onboarding, OnboardingStep::ConnectIntegration);
        } catch (\Exception $e) {
            // Onboarding should never break the main flow
            captureException($e);
        }
    }
}
