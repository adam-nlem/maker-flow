import { ONBOARDING_STEP_ORDER } from "~/models/enums/OnboardingStep"
import { useShowOnboarding } from "./useShowOnboarding"
import { useCompleteOnboardingStep } from "./useCompleteOnboardingStep"

export function useAdvanceOnboardingStep() {
    const { onboarding } = useShowOnboarding()
    const { completeStep } = useCompleteOnboardingStep()

    const currentStepIndex = (() => {
        if (!onboarding) return 0
        const idx = ONBOARDING_STEP_ORDER.findIndex((s) => !onboarding.isStepCompleted(s))
        return idx === -1 ? ONBOARDING_STEP_ORDER.length - 1 : idx
    })()

    const advanceStep = async () => {
        const currentStepEnum = ONBOARDING_STEP_ORDER[currentStepIndex]
        if (currentStepEnum && !onboarding?.isStepCompleted(currentStepEnum)) {
            await completeStep(currentStepEnum)
        }
    }

    return { advanceStep }
}
