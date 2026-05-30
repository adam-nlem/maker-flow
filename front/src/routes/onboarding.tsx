import { useEffect } from "react"
import type { ReactNode } from "react"
import { useNavigate } from "react-router-dom"

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
import { homePath } from "~/routes/routePaths"

const adminNodes: Record<AgencyAdminOnboardingStep, ReactNode> = {
  [AgencyAdminOnboardingStep.CreateAgency]: <OnboardingCreateAgencyStep />,
  [AgencyAdminOnboardingStep.CreateFirstProject]: <OnboardingCreateProjectStep />,
  [AgencyAdminOnboardingStep.InviteFirstClient]: <OnboardingInviteFirstClientStep />,
  [AgencyAdminOnboardingStep.ConnectFirstIntegration]: <OnboardingConnectIntegrationStep />,
  [AgencyAdminOnboardingStep.ShowSubscriptions]: <OnboardingSubscriptionStep />,
}

const collaboratorNodes: Record<AgencyCollaboratorOnboardingStep, ReactNode> = {
  [AgencyCollaboratorOnboardingStep.ExploreProjects]: <OnboardingExploreProjectsStep />,
  [AgencyCollaboratorOnboardingStep.ExploreContents]: <OnboardingExploreContentsStep />,
}

const clientNodes: Record<ClientOnboardingStep, ReactNode> = {
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
  const navigate = useNavigate()
  const { isAuthLoading, isAuthenticated, currentOnboardingStep } = useOnboardingFlow()
  const { user } = useCurrentUser()

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate(homePath, { replace: true })
    }
  }, [isAuthLoading, isAuthenticated, navigate])

  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="bg-clear bg-dot-pattern h-screen relative overflow-y-auto">
      {resolveStepNode(user?.displayRole ?? null, currentOnboardingStep)}
    </div>
  )
}
