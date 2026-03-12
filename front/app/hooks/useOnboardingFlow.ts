import { useEffect } from "react"
import { useNavigate } from "react-router"

import { useCurrentUser } from "~/hooks/api/users/useCurrentUser"
import { useShowOnboarding } from "~/hooks/api/onboarding/useShowOnboarding"
import { ONBOARDING_STEP_ORDER } from "~/models/enums/OnboardingStep"
import { useOnboardingStore } from "~/stores/onboarding/onboardingStore"
import { WELCOME_STEP_ORDER } from "~/models/enums/WelcomeStep"

export function useOnboardingFlow() {
    const navigate = useNavigate()
    const { user, isLoading: isAuthLoading } = useCurrentUser()
    const { onboarding, isLoading: isOnboardingLoading } = useShowOnboarding({ enabled: !!user })

    const welcomeStep = useOnboardingStore((s) => s.welcomeStep)

    useEffect(() => {
        if (!isAuthLoading && user && !isOnboardingLoading && onboarding?.isDismissed) {
            navigate('/', { replace: true })
        }
    }, [user, isAuthLoading, onboarding, isOnboardingLoading, navigate])

    const isAuthenticated = !!user

    const onboardingStepIndex = (() => {
        if (!onboarding) return 0
        const idx = ONBOARDING_STEP_ORDER.findIndex((s) => !onboarding.isStepCompleted(s))
        return idx === -1 ? ONBOARDING_STEP_ORDER.length - 1 : idx
    })()

    const welcomeStepIndex = WELCOME_STEP_ORDER.indexOf(welcomeStep)

    const totalSteps = isAuthenticated ? ONBOARDING_STEP_ORDER.length : WELCOME_STEP_ORDER.length
    const currentStep = isAuthenticated ? onboardingStepIndex : welcomeStepIndex

    const currentOnboardingStep = ONBOARDING_STEP_ORDER[onboardingStepIndex]
    const currentWelcomeStep = welcomeStep

    return {
        isAuthLoading,
        isAuthenticated,
        onboarding,
        currentStep,
        totalSteps,
        currentOnboardingStep,
        currentWelcomeStep,
    }
}
