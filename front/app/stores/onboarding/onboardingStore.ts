import { createResettableStore } from '~/stores/createResettableStore'

import { WelcomeStep } from '~/models/enums/WelcomeStep'

type OnboardingState = {
    welcomeStep: WelcomeStep
}

type OnboardingAction = {
    setWelcomeStep: (step: WelcomeStep) => void
}

export const useOnboardingStore = createResettableStore<OnboardingState & OnboardingAction>()(
    (set) => ({
        welcomeStep: WelcomeStep.Features,
        setWelcomeStep: (step) => set({ welcomeStep: step }),
    })
)
