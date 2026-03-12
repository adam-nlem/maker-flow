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
import { WelcomeStep } from "~/models/enums/WelcomeStep"

const welcomeNodes: Record<WelcomeStep, ReactNode> = {
    [WelcomeStep.Hero]: <WelcomeHeroStep />,
    [WelcomeStep.Features]: <WelcomeFeatureStep />,
    [WelcomeStep.HowItWorks]: <WelcomeHowItWorksStep />,
    [WelcomeStep.Register]: <OnboardingRegisterStep />,
    [WelcomeStep.VerifyOtp]: <OnboardingVerifyOtpStep />,
}

const onboardingNodes: Record<OnboardingStep, ReactNode> = {
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
        currentOnboardingStep,
        currentWelcomeStep,
    } = useOnboardingFlow()

    if (isAuthLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        )
    }

    return (
        <div className="bg-clear bg-dot-pattern min-h-screen relative">
            {isAuthenticated
                ? onboardingNodes[currentOnboardingStep]
                : welcomeNodes[currentWelcomeStep]}
        </div>
    )
}
