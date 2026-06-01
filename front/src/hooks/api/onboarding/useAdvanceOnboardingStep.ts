import { useOnboardingFlow } from "~/hooks/useOnboardingFlow"
import { useCompleteOnboardingStep } from "./useCompleteOnboardingStep"

export function useAdvanceOnboardingStep() {
    const { onboarding, currentOnboardingStep } = useOnboardingFlow()
    const { completeStep } = useCompleteOnboardingStep()

    const advanceStep = async () => {
        if (currentOnboardingStep && !onboarding?.isStepCompleted(currentOnboardingStep)) {
            await completeStep(currentOnboardingStep)
        }
    }

    return { advanceStep }
}
