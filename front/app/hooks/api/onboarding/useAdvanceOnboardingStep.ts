import { ONBOARDING_STEP_ORDER } from "~/models/enums/OnboardingStep"
import { useOnboardingFlow } from "~/hooks/useOnboardingFlow"
import { useCompleteOnboardingStep } from "./useCompleteOnboardingStep"
import { useDismissOnboarding } from "./useDismissOnboarding"

export function useAdvanceOnboardingStep() {
    const { onboarding } = useOnboardingFlow()
    const { completeStep } = useCompleteOnboardingStep()
    const { dismiss } = useDismissOnboarding()

    const lastStep = ONBOARDING_STEP_ORDER[ONBOARDING_STEP_ORDER.length - 1]

    const currentStep = onboarding
        ? ONBOARDING_STEP_ORDER.find((s) => !onboarding.isStepCompleted(s)) ?? lastStep
        : ONBOARDING_STEP_ORDER[0]

    const isLastStep = currentStep === lastStep

    const advanceStep = async () => {
        if (currentStep && !onboarding?.isStepCompleted(currentStep)) {
            await completeStep(currentStep)
        }
        if (isLastStep) {
            await dismiss()
        }
    }

    return { advanceStep }
}
