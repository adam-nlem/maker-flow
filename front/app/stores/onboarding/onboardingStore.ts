import { create } from 'zustand'

import { PreAuthStep } from '~/models/enums/PreAuthStep'

type OnboardingState = {
    preAuthStep: PreAuthStep
    pendingOtpToken: string | null
    otpEmail: string | null
}

type OnboardingAction = {
    setPreAuthStep: (step: PreAuthStep) => void
    setOtpCredentials: (token: string, email: string) => void
    clearOtpCredentials: () => void
}

export const useOnboardingStore = create<OnboardingState & OnboardingAction>()(
    (set) => ({
        preAuthStep: PreAuthStep.Hero,
        pendingOtpToken: null,
        otpEmail: null,
        setPreAuthStep: (step) => set({ preAuthStep: step }),
        setOtpCredentials: (token, email) => set({ pendingOtpToken: token, otpEmail: email }),
        clearOtpCredentials: () => set({ pendingOtpToken: null, otpEmail: null }),
    })
)
