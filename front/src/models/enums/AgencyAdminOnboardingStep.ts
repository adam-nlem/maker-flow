import { BuildingOffice2Icon, FolderPlusIcon, LinkIcon, SparklesIcon, UserPlusIcon } from "@heroicons/react/24/outline"
import type { ComponentType, SVGProps } from "react"

import { agencyHomePath, agencySettingsAgencyPath, agencySettingsProjectsPath, agencySettingsSubscriptionPath } from "~/routes/routePaths"

export enum AgencyAdminOnboardingStep {
    CreateAgency = 'create_agency',
    CreateFirstProject = 'create_first_project',
    InviteFirstClient = 'invite_first_client',
    ConnectFirstIntegration = 'connect_first_integration',
    ShowSubscriptions = 'show_subscriptions',
}

export const AGENCY_ADMIN_ONBOARDING_STEP_ORDER: AgencyAdminOnboardingStep[] = [
    AgencyAdminOnboardingStep.CreateAgency,
    AgencyAdminOnboardingStep.CreateFirstProject,
    AgencyAdminOnboardingStep.InviteFirstClient,
    AgencyAdminOnboardingStep.ConnectFirstIntegration,
    AgencyAdminOnboardingStep.ShowSubscriptions,
]

export const agencyAdminOnboardingStepTranslationKeys: Record<AgencyAdminOnboardingStep, string> = {
    [AgencyAdminOnboardingStep.CreateAgency]: "enums:onboardingStep.admin.titles.createAgency",
    [AgencyAdminOnboardingStep.CreateFirstProject]: "enums:onboardingStep.admin.titles.createFirstProject",
    [AgencyAdminOnboardingStep.InviteFirstClient]: "enums:onboardingStep.admin.titles.inviteFirstClient",
    [AgencyAdminOnboardingStep.ConnectFirstIntegration]: "enums:onboardingStep.admin.titles.connectFirstIntegration",
    [AgencyAdminOnboardingStep.ShowSubscriptions]: "enums:onboardingStep.admin.titles.showSubscriptions",
}

export const agencyAdminOnboardingStepDescriptionKeys: Record<AgencyAdminOnboardingStep, string> = {
    [AgencyAdminOnboardingStep.CreateAgency]: "enums:onboardingStep.admin.descriptions.createAgency",
    [AgencyAdminOnboardingStep.CreateFirstProject]: "enums:onboardingStep.admin.descriptions.createFirstProject",
    [AgencyAdminOnboardingStep.InviteFirstClient]: "enums:onboardingStep.admin.descriptions.inviteFirstClient",
    [AgencyAdminOnboardingStep.ConnectFirstIntegration]: "enums:onboardingStep.admin.descriptions.connectFirstIntegration",
    [AgencyAdminOnboardingStep.ShowSubscriptions]: "enums:onboardingStep.admin.descriptions.showSubscriptions",
}

export const agencyAdminOnboardingStepShortLabelKeys: Record<AgencyAdminOnboardingStep, string> = {
    [AgencyAdminOnboardingStep.CreateAgency]: "enums:onboardingStep.admin.shortLabels.createAgency",
    [AgencyAdminOnboardingStep.CreateFirstProject]: "enums:onboardingStep.admin.shortLabels.createFirstProject",
    [AgencyAdminOnboardingStep.InviteFirstClient]: "enums:onboardingStep.admin.shortLabels.inviteFirstClient",
    [AgencyAdminOnboardingStep.ConnectFirstIntegration]: "enums:onboardingStep.admin.shortLabels.connectFirstIntegration",
    [AgencyAdminOnboardingStep.ShowSubscriptions]: "enums:onboardingStep.admin.shortLabels.showSubscriptions",
}

export const agencyAdminOnboardingStepToIcon: Record<AgencyAdminOnboardingStep, ComponentType<SVGProps<SVGSVGElement>>> = {
    [AgencyAdminOnboardingStep.CreateAgency]: BuildingOffice2Icon,
    [AgencyAdminOnboardingStep.CreateFirstProject]: FolderPlusIcon,
    [AgencyAdminOnboardingStep.InviteFirstClient]: UserPlusIcon,
    [AgencyAdminOnboardingStep.ConnectFirstIntegration]: LinkIcon,
    [AgencyAdminOnboardingStep.ShowSubscriptions]: SparklesIcon,
}

export const agencyAdminOnboardingStepToNavigateTo: Partial<Record<AgencyAdminOnboardingStep, string>> = {
    [AgencyAdminOnboardingStep.CreateAgency]: agencySettingsAgencyPath,
    [AgencyAdminOnboardingStep.CreateFirstProject]: agencySettingsProjectsPath,
    [AgencyAdminOnboardingStep.ConnectFirstIntegration]: agencyHomePath,
    [AgencyAdminOnboardingStep.ShowSubscriptions]: agencySettingsSubscriptionPath,
}
