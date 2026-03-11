<?php

namespace App\Service;

use App\Entity\Enum\OnboardingStep;
use App\Entity\Onboarding;
use App\Entity\User;
use App\Helper\DateHelper;
use App\Repository\OnboardingRepository;

class OnboardingService
{
    public function __construct(
        private readonly OnboardingRepository $onboardingRepository,
    ) {}

    public function getOrCreateOnboarding(User $user): Onboarding
    {
        $onboarding = $this->onboardingRepository->getByUser($user);

        if ($onboarding === null) {
            $onboarding = (new Onboarding())
                ->setUser($user);
            $this->onboardingRepository->save($onboarding, true);
        }

        return $onboarding;
    }

    public function completeStep(Onboarding $onboarding, OnboardingStep $step): Onboarding
    {
        if ($onboarding->isStepCompleted($step)) {
            return $onboarding;
        }

        $onboarding->addCompletedStep($step);

        if ($this->areAllStepsCompleted($onboarding)) {
            $onboarding->setDismissedAt(DateHelper::createUtcDateTimeImmutable());
        }

        $this->onboardingRepository->save($onboarding, true);

        return $onboarding;
    }

    public function dismiss(Onboarding $onboarding): Onboarding
    {
        $onboarding->setDismissedAt(DateHelper::createUtcDateTimeImmutable());
        $this->onboardingRepository->save($onboarding, true);

        return $onboarding;
    }

    private function areAllStepsCompleted(Onboarding $onboarding): bool
    {
        foreach (OnboardingStep::cases() as $step) {
            if (!$onboarding->isStepCompleted($step)) {
                return false;
            }
        }

        return true;
    }
}
