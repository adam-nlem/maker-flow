import type { ReactNode } from "react"

import WelcomeHeroStep from "~/components/welcome/WelcomeHeroStep"
import WelcomeFeatureStep from "~/components/welcome/WelcomeFeatureStep"
import WelcomeHowItWorksStep from "~/components/welcome/WelcomeHowItWorksStep"
import OnboardingRegisterStep from "~/components/onboarding/OnboardingRegisterStep"
import OnboardingVerifyOtpStep from "~/components/onboarding/OnboardingVerifyOtpStep"
import OnboardingCreateProjectStep from "~/components/onboarding/OnboardingCreateProjectStep"
import OnboardingConnectIntegrationStep from "~/components/onboarding/OnboardingConnectIntegrationStep"
import OnboardingCreatorProfileStep from "~/components/onboarding/OnboardingCreatorProfileStep"
import OnboardingCreateScriptStep from "~/components/onboarding/OnboardingCreateScriptStep"
import OnboardingGenerateScriptStep from "~/components/onboarding/OnboardingGenerateScriptStep"
import OnboardingSubscriptionStep from "~/components/onboarding/OnboardingSubscriptionStep"
import { useOnboardingFlow } from "~/hooks/useOnboardingFlow"
import { OnboardingStep } from "~/models/enums/OnboardingStep"
import { PreAuthStep } from "~/models/enums/PreAuthStep"

const preAuthNodes: Record<PreAuthStep, ReactNode> = {
    [PreAuthStep.Hero]: <WelcomeHeroStep />,
    [PreAuthStep.Features]: <WelcomeFeatureStep />,
    [PreAuthStep.HowItWorks]: <WelcomeHowItWorksStep />,
    [PreAuthStep.Register]: <OnboardingRegisterStep />,
    [PreAuthStep.VerifyOtp]: <OnboardingVerifyOtpStep />,
}

const postAuthNodes: Record<OnboardingStep, ReactNode> = {
    [OnboardingStep.CreateFirstProject]: <OnboardingCreateProjectStep />,
    [OnboardingStep.ConnectIntegration]: <OnboardingConnectIntegrationStep />,
    [OnboardingStep.CreateCreatorProfile]: <OnboardingCreatorProfileStep />,
    [OnboardingStep.CreateFirstScript]: <OnboardingCreateScriptStep />,
    [OnboardingStep.GenerateFirstScript]: <OnboardingGenerateScriptStep />,
    [OnboardingStep.ShowSubscriptions]: <OnboardingSubscriptionStep />,
}

export default function OnboardingPage() {
    const {
        isAuthLoading,
        isAuthenticated,
        currentStep,
        totalSteps,
        currentPostAuthStep,
        currentPreAuthStep,
    } = useOnboardingFlow()

    if (isAuthLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        )
    }

    const node = isAuthenticated
        ? postAuthNodes[currentPostAuthStep]
        : preAuthNodes[currentPreAuthStep]

    return (
        <div className="bg-clear bg-dot-pattern min-h-screen relative">
            {node}

            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                {Array.from({ length: totalSteps }).map((_, i) => (
                    <div
                        key={i}
                        className={`h-2 rounded-full transition-all ${i === currentStep ? 'bg-primary w-6' : 'bg-light-gray w-2'
                            }`}
                    />
                ))}
            </div>
        </div>
    )
}
