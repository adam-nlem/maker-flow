import { ONBOARDING_STEP_ORDER } from "~/models/enums/OnboardingStep"
import { useOnboardingFlow } from "~/hooks/useOnboardingFlow"
import { useCompleteOnboardingStep } from "./useCompleteOnboardingStep"

export function useAdvanceOnboardingStep() {
    const { onboarding } = useOnboardingFlow()
    const { completeStep } = useCompleteOnboardingStep()

    const currentStep = onboarding
        ? ONBOARDING_STEP_ORDER.find((s) => !onboarding.isStepCompleted(s)) ?? ONBOARDING_STEP_ORDER[ONBOARDING_STEP_ORDER.length - 1]
        : ONBOARDING_STEP_ORDER[0]

    const advanceStep = async () => {
        if (currentStep && !onboarding?.isStepCompleted(currentStep)) {
            await completeStep(currentStep)
        }
    }

    return { advanceStep }
}
