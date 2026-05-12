import type { ReactNode } from "react"

import WelcomeFeatureStep from "~/components/welcome/WelcomeFeatureStep"
import WelcomeHowItWorksStep from "~/components/welcome/WelcomeHowItWorksStep"
import OnboardingWelcomeTourStep from "~/components/onboarding/OnboardingWelcomeTourStep"
import OnboardingCreateAgencyStep from "~/components/onboarding/OnboardingCreateAgencyStep"
import OnboardingCreateProjectStep from "~/components/onboarding/OnboardingCreateProjectStep"
import OnboardingInviteFirstClientStep from "~/components/onboarding/OnboardingInviteFirstClientStep"
import OnboardingConnectIntegrationStep from "~/components/onboarding/OnboardingConnectIntegrationStep"
import OnboardingSubscriptionStep from "~/components/onboarding/OnboardingSubscriptionStep"
import OnboardingExploreProjectsStep from "~/components/onboarding/OnboardingExploreProjectsStep"
import OnboardingExploreContentsStep from "~/components/onboarding/OnboardingExploreContentsStep"
import { useOnboardingFlow } from "~/hooks/useOnboardingFlow"
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser"
import { AgencyAdminOnboardingStep } from "~/models/enums/AgencyAdminOnboardingStep"
import { AgencyCollaboratorOnboardingStep } from "~/models/enums/AgencyCollaboratorOnboardingStep"
import { ClientOnboardingStep } from "~/models/enums/ClientOnboardingStep"
import { UserRole } from "~/models/enums/UserRole"
import { WelcomeStep } from "~/models/enums/WelcomeStep"

const welcomeNodes: Record<WelcomeStep, ReactNode> = {
    [WelcomeStep.Features]: <WelcomeFeatureStep />,
    [WelcomeStep.HowItWorks]: <WelcomeHowItWorksStep />,
}

const adminNodes: Record<AgencyAdminOnboardingStep, ReactNode> = {
    [AgencyAdminOnboardingStep.WelcomeTour]: <OnboardingWelcomeTourStep />,
    [AgencyAdminOnboardingStep.CreateAgency]: <OnboardingCreateAgencyStep />,
    [AgencyAdminOnboardingStep.CreateFirstProject]: <OnboardingCreateProjectStep />,
    [AgencyAdminOnboardingStep.InviteFirstClient]: <OnboardingInviteFirstClientStep />,
    [AgencyAdminOnboardingStep.ConnectFirstIntegration]: <OnboardingConnectIntegrationStep />,
    [AgencyAdminOnboardingStep.ShowSubscriptions]: <OnboardingSubscriptionStep />,
}

const collaboratorNodes: Record<AgencyCollaboratorOnboardingStep, ReactNode> = {
    [AgencyCollaboratorOnboardingStep.WelcomeTour]: <OnboardingWelcomeTourStep />,
    [AgencyCollaboratorOnboardingStep.ExploreProjects]: <OnboardingExploreProjectsStep />,
    [AgencyCollaboratorOnboardingStep.ExploreContents]: <OnboardingExploreContentsStep />,
}

const clientNodes: Record<ClientOnboardingStep, ReactNode> = {
    [ClientOnboardingStep.WelcomeTour]: <OnboardingWelcomeTourStep />,
    [ClientOnboardingStep.ConnectFirstIntegration]: <OnboardingConnectIntegrationStep />,
    [ClientOnboardingStep.ExploreContents]: <OnboardingExploreContentsStep />,
}

function resolveStepNode(role: UserRole | null, step: string): ReactNode {
    if (role === UserRole.Client) {
        return clientNodes[step as ClientOnboardingStep] ?? null
    }
    if (role === UserRole.Editor || role === UserRole.Viewer) {
        return collaboratorNodes[step as AgencyCollaboratorOnboardingStep] ?? null
    }
    return adminNodes[step as AgencyAdminOnboardingStep] ?? null
}

export default function OnboardingPage() {
    const { isAuthLoading, isAuthenticated, currentOnboardingStep, currentWelcomeStep } = useOnboardingFlow()
    const { user } = useCurrentUser()

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
                ? resolveStepNode(user?.displayRole ?? null, currentOnboardingStep)
                : welcomeNodes[currentWelcomeStep]}
        </div>
    )
}
