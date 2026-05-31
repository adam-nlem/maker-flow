<?php

namespace App\Service;

use App\Entity\Enum\OnboardingStep;
use App\Entity\Enum\UserRole;
use App\Entity\Onboarding;
use App\Entity\User;
use App\Exception\Onboarding\InvalidOnboardingStepException;
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

        if ($onboarding !== null) {
            return $onboarding;
        }

        $onboarding = (new Onboarding())->setUser($user);

        // Auto dismiss when no applicable values
        if ($this->getApplicableStepValues($user) === []) {
            $onboarding->setDismissedAt(DateHelper::createUtcDateTimeImmutable());
        }

        $this->onboardingRepository->save($onboarding, true);

        return $onboarding;
    }

    public function completeStep(Onboarding $onboarding, string $stepValue, User $user): Onboarding
    {
        $applicableStepValues = $this->getApplicableStepValues($user);

        if (!in_array($stepValue, $applicableStepValues, true)) {
            throw new InvalidOnboardingStepException();
        }

        if ($onboarding->isStepCompleted($stepValue)) {
            return $onboarding;
        }

        $onboarding->addCompletedStep($stepValue);

        if ($this->areAllStepsCompleted($onboarding, $user)) {
            $onboarding->setDismissedAt(DateHelper::createUtcDateTimeImmutable());
        }

        $this->onboardingRepository->save($onboarding, true);

        return $onboarding;
    }

    // Kept for future "skip-all" CTA; not used by current flows.
    public function dismiss(Onboarding $onboarding): Onboarding
    {
        $onboarding->setDismissedAt(DateHelper::createUtcDateTimeImmutable());
        $this->onboardingRepository->save($onboarding, true);

        return $onboarding;
    }

    /**
     * @return string[]
     */
    public function getApplicableStepValues(User $user): array
    {
        if ($user->hasRole(UserRole::Client)) {
            return [
                OnboardingStep::ConnectFirstIntegration->value,
                OnboardingStep::ExploreContents->value,
            ];
        }

        if ($user->hasRole(UserRole::Admin)) {
            return [
                OnboardingStep::CreateAgency->value,
                OnboardingStep::CreateFirstProject->value,
                OnboardingStep::InviteFirstClient->value,
                OnboardingStep::ConnectFirstIntegration->value,
                OnboardingStep::ShowSubscriptions->value,
            ];
        }

        return [];
    }

    private function areAllStepsCompleted(Onboarding $onboarding, User $user): bool
    {
        foreach ($this->getApplicableStepValues($user) as $stepValue) {
            if (!$onboarding->isStepCompleted($stepValue)) {
                return false;
            }
        }

        return true;
    }
}
