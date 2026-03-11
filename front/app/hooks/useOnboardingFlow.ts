import { useEffect, useState } from "react"
import { useNavigate } from "react-router"

import { useCurrentUser } from "~/hooks/api/users/useCurrentUser"
import { useShowOnboarding } from "~/hooks/api/onboarding/useShowOnboarding"
import { useCompleteOnboardingStep } from "~/hooks/api/onboarding/useCompleteOnboardingStep"
import { OnboardingStep } from "~/models/enums/OnboardingStep"
import { useFocusProjectStore } from "~/stores/project/focusProjectStore"
import { useFocusScriptStore } from "~/stores/scripts/focusScriptStore"

const PRE_AUTH_STEPS = 5
const POST_AUTH_STEPS = 6

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
    const { completeStep } = useCompleteOnboardingStep()

    const focusedProjectUuid = useFocusProjectStore((s) => s.focusedProjectUuid)
    const setFocusedProjectUuid = useFocusProjectStore((s) => s.setFocusedProjectUuid)

    const focusedScriptUuid = useFocusScriptStore((s) => s.focusedScriptUuid)
    const setFocusedScriptUuid = useFocusScriptStore((s) => s.setFocusedScriptUuid)

    const [preAuthStep, setPreAuthStep] = useState(0)
    const [pendingOtpToken, setPendingOtpToken] = useState<string | null>(null)
    const [otpEmail, setOtpEmail] = useState<string | null>(null)

    useEffect(() => {
        if (!isAuthLoading && user && !isOnboardingLoading && onboarding?.isDismissed) {
            navigate('/', { replace: true })
        }
    }, [user, isAuthLoading, onboarding, isOnboardingLoading, navigate])

    const isAuthenticated = !!user

    const postAuthStep = (() => {
        if (!onboarding) return 0
        const idx = POST_AUTH_STEP_ORDER.findIndex((s) => !onboarding.isStepCompleted(s))
        return idx === -1 ? POST_AUTH_STEPS - 1 : idx
    })()

    const totalSteps = isAuthenticated ? POST_AUTH_STEPS : PRE_AUTH_STEPS
    const currentStep = isAuthenticated ? postAuthStep : preAuthStep

    const handleRegistered = (token: string, email: string) => {
        setPendingOtpToken(token)
        setOtpEmail(email)
        setPreAuthStep(4)
    }

    const handleProjectCreated = (projectUuid: string) => {
        setFocusedProjectUuid(projectUuid)
    }

    const handleScriptCreated = (scriptUuid: string) => {
        setFocusedScriptUuid(scriptUuid)
    }

    const advanceStep = async () => {
        const currentStepEnum = POST_AUTH_STEP_ORDER[postAuthStep]
        if (currentStepEnum && !onboarding?.isStepCompleted(currentStepEnum)) {
            await completeStep(currentStepEnum)
        }
    }

    return {
        isAuthLoading,
        isOnboardingLoading,
        isAuthenticated,
        currentStep,
        totalSteps,
        preAuthStep,
        postAuthStep,
        pendingOtpToken,
        otpEmail,
        focusedProjectUuid,
        setPreAuthStep,
        handleRegistered,
        handleProjectCreated,
        handleScriptCreated,
        onboardingScriptUuid: focusedScriptUuid,
        advanceStep,
    }
}
