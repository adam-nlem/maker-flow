import { useEffect } from "react"
import { useNavigate } from "react-router"

import { useCurrentUser } from "~/hooks/api/users/useCurrentUser"
import { useShowOnboarding } from "~/hooks/api/onboarding/useShowOnboarding"
import { ONBOARDING_STEP_ORDER } from "~/models/enums/OnboardingStep"
import { useOnboardingStore } from "~/stores/onboarding/onboardingStore"

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

    const currentOnboardingStep = (() => {
        if (!onboarding) return ONBOARDING_STEP_ORDER[0]
        return ONBOARDING_STEP_ORDER.find((s) => !onboarding.isStepCompleted(s))
            ?? ONBOARDING_STEP_ORDER[ONBOARDING_STEP_ORDER.length - 1]
    })()

    const currentWelcomeStep = welcomeStep

    return {
        isAuthLoading,
        isAuthenticated,
        currentOnboardingStep,
        currentWelcomeStep,
    }
}
