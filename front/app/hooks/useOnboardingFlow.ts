import { useEffect } from "react"
import { useNavigate } from "react-router"

import { useCurrentUser } from "~/hooks/api/users/useCurrentUser"
import { useShowOnboarding } from "~/hooks/api/onboarding/useShowOnboarding"
import { OnboardingStep } from "~/models/enums/OnboardingStep"
import { useOnboardingStore } from "~/stores/onboarding/onboardingStore"
import { PRE_AUTH_STEP_ORDER } from "~/models/enums/PreAuthStep"

const POST_AUTH_STEP_ORDER = [
    OnboardingStep.CreateFirstProject,
    OnboardingStep.ConnectIntegration,
    OnboardingStep.CreateCreatorProfile,
    OnboardingStep.CreateFirstScript,
    OnboardingStep.GenerateFirstScript,
    OnboardingStep.ShowSubscriptions,
]

export function useOnboardingFlow() {
    const navigate = useNavigate()
    const { user, isLoading: isAuthLoading } = useCurrentUser()
    const { onboarding, isLoading: isOnboardingLoading } = useShowOnboarding({ enabled: !!user })

    const preAuthStep = useOnboardingStore((s) => s.preAuthStep)

    useEffect(() => {
        if (!isAuthLoading && user && !isOnboardingLoading && onboarding?.isDismissed) {
            navigate('/', { replace: true })
        }
    }, [user, isAuthLoading, onboarding, isOnboardingLoading, navigate])

    const isAuthenticated = !!user

    const postAuthStepIndex = (() => {
        if (!onboarding) return 0
        const idx = POST_AUTH_STEP_ORDER.findIndex((s) => !onboarding.isStepCompleted(s))
        return idx === -1 ? POST_AUTH_STEP_ORDER.length - 1 : idx
    })()

    const preAuthStepIndex = PRE_AUTH_STEP_ORDER.indexOf(preAuthStep)

    const totalSteps = isAuthenticated ? POST_AUTH_STEP_ORDER.length : PRE_AUTH_STEP_ORDER.length
    const currentStep = isAuthenticated ? postAuthStepIndex : preAuthStepIndex

    const currentPostAuthStep = POST_AUTH_STEP_ORDER[postAuthStepIndex]
    const currentPreAuthStep = preAuthStep

    return {
        isAuthLoading,
        isAuthenticated,
        currentStep,
        totalSteps,
        currentPostAuthStep,
        currentPreAuthStep,
    }
}
