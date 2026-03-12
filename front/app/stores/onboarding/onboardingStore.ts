import { create } from 'zustand'

import { WelcomeStep } from '~/models/enums/WelcomeStep'

type OnboardingState = {
    welcomeStep: WelcomeStep
    pendingOtpToken: string | null
    otpEmail: string | null
}

type OnboardingAction = {
    setWelcomeStep: (step: WelcomeStep) => void
    setOtpCredentials: (token: string, email: string) => void
    clearOtpCredentials: () => void
}

export const useOnboardingStore = create<OnboardingState & OnboardingAction>()(
    (set) => ({
        welcomeStep: WelcomeStep.Features,
        pendingOtpToken: null,
        otpEmail: null,
        setWelcomeStep: (step) => set({ welcomeStep: step }),
        setOtpCredentials: (token, email) => set({ pendingOtpToken: token, otpEmail: email }),
        clearOtpCredentials: () => set({ pendingOtpToken: null, otpEmail: null }),
    })
)
