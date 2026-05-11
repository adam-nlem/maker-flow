import type { ReactNode } from "react"

import WelcomeFeatureStep from "~/components/welcome/WelcomeFeatureStep"
import WelcomeHowItWorksStep from "~/components/welcome/WelcomeHowItWorksStep"
import OnboardingCreateAgencyStep from "~/components/onboarding/OnboardingCreateAgencyStep"
import OnboardingCreateProjectStep from "~/components/onboarding/OnboardingCreateProjectStep"
import OnboardingConnectIntegrationStep from "~/components/onboarding/OnboardingConnectIntegrationStep"
import OnboardingCreateScriptStep from "~/components/onboarding/OnboardingCreateScriptStep"
import OnboardingGenerateScriptStep from "~/components/onboarding/OnboardingGenerateScriptStep"
import OnboardingSubscriptionStep from "~/components/onboarding/OnboardingSubscriptionStep"
import { useOnboardingFlow } from "~/hooks/useOnboardingFlow"
import { OnboardingStep } from "~/models/enums/OnboardingStep"
import { WelcomeStep } from "~/models/enums/WelcomeStep"

const welcomeNodes: Record<WelcomeStep, ReactNode> = {
    [WelcomeStep.Features]: <WelcomeFeatureStep />,
    [WelcomeStep.HowItWorks]: <WelcomeHowItWorksStep />,
}

const onboardingNodes: Record<OnboardingStep, ReactNode> = {
    [OnboardingStep.CreateAgency]: <OnboardingCreateAgencyStep />,
    [OnboardingStep.CreateFirstProject]: <OnboardingCreateProjectStep />,
    [OnboardingStep.ConnectIntegration]: <OnboardingConnectIntegrationStep />,
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
        <div className="bg-clear bg-dot-pattern h-screen relative overflow-y-auto">
            {isAuthenticated
                ? onboardingNodes[currentOnboardingStep]
                : welcomeNodes[currentWelcomeStep]}
        </div>
    )
}
