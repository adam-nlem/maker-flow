import { ONBOARDING_STEP_ORDER } from "~/models/enums/OnboardingStep"
import { useShowOnboarding } from "./useShowOnboarding"
import { useCompleteOnboardingStep } from "./useCompleteOnboardingStep"

export function useAdvanceOnboardingStep() {
    const { onboarding } = useShowOnboarding()
    const { completeStep } = useCompleteOnboardingStep()

    const currentStep = ONBOARDING_STEP_ORDER.find((s) => !onboarding?.isStepCompleted(s))

    const advanceStep = async () => {
        if (currentStep) {
            await completeStep(currentStep)
        }
    }

    return { advanceStep }
}
