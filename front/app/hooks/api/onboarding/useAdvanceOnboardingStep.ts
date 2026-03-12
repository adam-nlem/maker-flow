import { OnboardingStep } from "~/models/enums/OnboardingStep"
import { useShowOnboarding } from "./useShowOnboarding"
import { useCompleteOnboardingStep } from "./useCompleteOnboardingStep"

const POST_AUTH_STEP_ORDER = [
    OnboardingStep.CreateFirstProject,
    OnboardingStep.ConnectIntegration,
    OnboardingStep.CreateCreatorProfile,
    OnboardingStep.CreateFirstScript,
    OnboardingStep.GenerateFirstScript,
    OnboardingStep.ShowSubscriptions,
]

export function useAdvanceOnboardingStep() {
    const { onboarding } = useShowOnboarding()
    const { completeStep } = useCompleteOnboardingStep()

    const currentStepIndex = (() => {
        if (!onboarding) return 0
        const idx = POST_AUTH_STEP_ORDER.findIndex((s) => !onboarding.isStepCompleted(s))
        return idx === -1 ? POST_AUTH_STEP_ORDER.length - 1 : idx
    })()

    const advanceStep = async () => {
        const currentStepEnum = POST_AUTH_STEP_ORDER[currentStepIndex]
        if (currentStepEnum && !onboarding?.isStepCompleted(currentStepEnum)) {
            await completeStep(currentStepEnum)
        }
    }

    return { advanceStep }
}
