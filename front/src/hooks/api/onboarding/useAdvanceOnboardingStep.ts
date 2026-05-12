import { useOnboardingFlow } from "~/hooks/useOnboardingFlow"
import { useCompleteOnboardingStep } from "./useCompleteOnboardingStep"
import { useDismissOnboarding } from "./useDismissOnboarding"

export function useAdvanceOnboardingStep() {
    const { onboarding, flowConfig } = useOnboardingFlow()
    const { completeStep } = useCompleteOnboardingStep()
    const { dismiss } = useDismissOnboarding()

    const order = flowConfig.order
    const lastStep = order[order.length - 1]

    const currentStep = onboarding
        ? order.find((s) => !onboarding.isStepCompleted(s)) ?? lastStep
        : order[0]

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
