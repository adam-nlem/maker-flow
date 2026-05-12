<?php

namespace App\Service;

use App\Entity\Enum\AgencyAdminOnboardingStep;
use App\Entity\Enum\AgencyCollaboratorOnboardingStep;
use App\Entity\Enum\ClientOnboardingStep;
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

        if ($onboarding === null) {
            $onboarding = (new Onboarding())
                ->setUser($user);
            $this->onboardingRepository->save($onboarding, true);
        }

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
            return array_map(fn (ClientOnboardingStep $step) => $step->value, ClientOnboardingStep::cases());
        }

        if ($user->hasRole(UserRole::Admin)) {
            return array_map(fn (AgencyAdminOnboardingStep $step) => $step->value, AgencyAdminOnboardingStep::cases());
        }

        if ($user->hasRole(UserRole::Editor) || $user->hasRole(UserRole::Viewer)) {
            return array_map(fn (AgencyCollaboratorOnboardingStep $step) => $step->value, AgencyCollaboratorOnboardingStep::cases());
        }

        return array_map(fn (AgencyAdminOnboardingStep $step) => $step->value, AgencyAdminOnboardingStep::cases());
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
