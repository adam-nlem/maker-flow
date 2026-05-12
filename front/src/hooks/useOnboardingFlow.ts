import { useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"

import { agencyHomePath, clientHomePath } from "~/routes/routePaths"
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser"
import { useShowOnboarding } from "~/hooks/api/onboarding/useShowOnboarding"
import { getOnboardingFlowConfig, type OnboardingStepValue } from "~/models/enums/onboardingFlow"
import { useOnboardingStore } from "~/stores/onboarding/onboardingStore"
import { WELCOME_STEP_ORDER } from "~/models/enums/WelcomeStep"

export function useOnboardingFlow() {
    const navigate = useNavigate()
    const { user, isLoading: isAuthLoading } = useCurrentUser()
    const { onboarding, isLoading: isOnboardingLoading } = useShowOnboarding({ enabled: !!user })

    const welcomeStep = useOnboardingStore((s) => s.welcomeStep)

    const flowConfig = useMemo(() => getOnboardingFlowConfig(user?.displayRole ?? null), [user?.displayRole])

    const dismissedRedirectPath = user?.isClient ? clientHomePath : agencyHomePath

    useEffect(() => {
        if (!isAuthLoading && user && !isOnboardingLoading && onboarding?.isDismissed) {
            navigate(dismissedRedirectPath, { replace: true })
        }
    }, [user, isAuthLoading, onboarding, isOnboardingLoading, navigate, dismissedRedirectPath])

    const isAuthenticated = !!user

    const lastStep = flowConfig.order[flowConfig.order.length - 1]
    const currentOnboardingStep: OnboardingStepValue = onboarding
        ? flowConfig.order.find((s) => !onboarding.isStepCompleted(s)) ?? lastStep
        : flowConfig.order[0]

    const welcomeStepIndex = WELCOME_STEP_ORDER.indexOf(welcomeStep)

    const totalSteps = isAuthenticated ? flowConfig.order.length : WELCOME_STEP_ORDER.length
    const currentStep = isAuthenticated ? flowConfig.order.indexOf(currentOnboardingStep) : welcomeStepIndex

    return {
        isAuthLoading,
        isAuthenticated,
        onboarding,
        currentStep,
        totalSteps,
        currentOnboardingStep,
        currentWelcomeStep: welcomeStep,
        flowConfig,
    }
}
