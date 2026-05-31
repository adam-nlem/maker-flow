import { useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"

import { agencyHomePath, clientHomePath } from "~/routes/routePaths"
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser"
import { useShowOnboarding } from "~/hooks/api/onboarding/useShowOnboarding"
import { ONBOARDING_STEP_CONFIG, OnboardingStep, getOrderedStepsForRole, type OnboardingStepConfig } from "~/models/enums/OnboardingStep"

export function useOnboardingFlow() {
  const navigate = useNavigate()
  const { user, isLoading: isAuthLoading } = useCurrentUser()
  const { onboarding, isLoading: isOnboardingLoading } = useShowOnboarding({ enabled: !!user })

  const order = useMemo(() => getOrderedStepsForRole(user?.displayRole ?? null), [user?.displayRole])

  const dismissedRedirectPath = user?.isClient ? clientHomePath : agencyHomePath

  useEffect(() => {
    if (!isAuthLoading && user && !isOnboardingLoading && onboarding?.isDismissed) {
      navigate(dismissedRedirectPath, { replace: true })
    }
  }, [user, isAuthLoading, onboarding, isOnboardingLoading, navigate, dismissedRedirectPath])

  const isAuthenticated = !!user

  const currentOnboardingStep: OnboardingStep | undefined = order.length === 0
    ? undefined
    : onboarding
      ? order.find((s) => !onboarding.isStepCompleted(s)) ?? order[order.length - 1]
      : order[0]

  const totalSteps = order.length
  const currentStepIndex = currentOnboardingStep ? order.indexOf(currentOnboardingStep) : 0
  const currentStepConfig: OnboardingStepConfig | null = currentOnboardingStep
    ? ONBOARDING_STEP_CONFIG[currentOnboardingStep]
    : null

  return {
    isAuthLoading,
    isAuthenticated,
    onboarding,
    order,
    currentStepIndex,
    totalSteps,
    currentOnboardingStep,
    currentStepConfig,
  }
}
