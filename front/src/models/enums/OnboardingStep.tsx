import { BuildingOffice2Icon, DocumentTextIcon, FolderPlusIcon, LinkIcon, SparklesIcon, UserPlusIcon } from "@heroicons/react/24/outline"
import type { ComponentType, ReactNode, SVGProps } from "react"

import OnboardingConnectIntegrationStep from "~/components/onboarding/steps/OnboardingConnectIntegrationStep"
import OnboardingCreateAgencyStep from "~/components/onboarding/steps/OnboardingCreateAgencyStep"
import OnboardingCreateProjectStep from "~/components/onboarding/steps/OnboardingCreateProjectStep"
import OnboardingExploreContentsStep from "~/components/onboarding/steps/OnboardingExploreContentsStep"
import OnboardingInviteFirstClientStep from "~/components/onboarding/steps/OnboardingInviteFirstClientStep"
import OnboardingSubscriptionStep from "~/components/onboarding/steps/OnboardingSubscriptionStep"

import { UserRole } from "./UserRole"
import OnboardingCreateAgencyPreview from "~/components/onboarding/previews/OnboardingCreateAgencyPreview"
import OnboardingCreateProjectPreview from "~/components/onboarding/previews/OnboardingCreateProjectPreview"
import OnboardingInviteFirstClientPreview from "~/components/onboarding/previews/OnboardingInviteFirstClientPreview"
import OnboardingConnectIntegrationPreview from "~/components/onboarding/previews/OnboardingConnectIntegrationPreview"

export enum OnboardingStep {
  CreateAgency = 'create_agency',
  CreateFirstProject = 'create_first_project',
  InviteFirstClient = 'invite_first_client',
  ConnectFirstIntegration = 'connect_first_integration',
  ShowSubscriptions = 'show_subscriptions',
  ExploreContents = 'explore_contents',
}

export interface OnboardingStepConfig {
  titleKey: string
  descriptionKey: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  stepComponent: ReactNode
  previewComponent?: ReactNode
  applicableRoles: UserRole[]
}

export const ONBOARDING_STEP_CONFIG: Record<OnboardingStep, OnboardingStepConfig> = {
  [OnboardingStep.CreateAgency]: {
    titleKey: "enums:onboardingStep.titles.createAgency",
    descriptionKey: "enums:onboardingStep.descriptions.createAgency",
    icon: BuildingOffice2Icon,
    stepComponent: <OnboardingCreateAgencyStep />,
    previewComponent: <OnboardingCreateAgencyPreview />,
    applicableRoles: [UserRole.Admin],
  },
  [OnboardingStep.CreateFirstProject]: {
    titleKey: "enums:onboardingStep.titles.createFirstProject",
    descriptionKey: "enums:onboardingStep.descriptions.createFirstProject",
    icon: FolderPlusIcon,
    stepComponent: <OnboardingCreateProjectStep />,
    previewComponent: <OnboardingCreateProjectPreview />,
    applicableRoles: [UserRole.Admin],
  },
  [OnboardingStep.InviteFirstClient]: {
    titleKey: "enums:onboardingStep.titles.inviteFirstClient",
    descriptionKey: "enums:onboardingStep.descriptions.inviteFirstClient",
    icon: UserPlusIcon,
    stepComponent: <OnboardingInviteFirstClientStep />,
    previewComponent: <OnboardingInviteFirstClientPreview />,
    applicableRoles: [UserRole.Admin],
  },
  [OnboardingStep.ConnectFirstIntegration]: {
    titleKey: "enums:onboardingStep.titles.connectFirstIntegration",
    descriptionKey: "enums:onboardingStep.descriptions.connectFirstIntegration",
    icon: LinkIcon,
    stepComponent: <OnboardingConnectIntegrationStep />,
    previewComponent: <OnboardingConnectIntegrationPreview />,
    applicableRoles: [UserRole.Admin, UserRole.Client],
  },
  [OnboardingStep.ShowSubscriptions]: {
    titleKey: "enums:onboardingStep.titles.showSubscriptions",
    descriptionKey: "enums:onboardingStep.descriptions.showSubscriptions",
    icon: SparklesIcon,
    stepComponent: <OnboardingSubscriptionStep />,
    applicableRoles: [UserRole.Admin],
  },
  [OnboardingStep.ExploreContents]: {
    titleKey: "enums:onboardingStep.titles.exploreContents",
    descriptionKey: "enums:onboardingStep.descriptions.exploreContents",
    icon: DocumentTextIcon,
    stepComponent: <OnboardingExploreContentsStep />,
    previewComponent: <OnboardingExploreContentsStep />,
    applicableRoles: [UserRole.Client],
  },
}

export function getOrderedStepsForRole(role: UserRole | null): OnboardingStep[] {
  if (role === null) {
    return []
  }

  return Object.values(OnboardingStep).filter(
    (step) => ONBOARDING_STEP_CONFIG[step].applicableRoles.includes(role),
  )
}
