import { DocumentTextIcon, FolderOpenIcon } from "@heroicons/react/24/outline"
import type { ComponentType, SVGProps } from "react"

import { agencyContentsPath, agencyHomePath } from "~/routes/routePaths"

export enum AgencyCollaboratorOnboardingStep {
    ExploreProjects = 'explore_projects',
    ExploreContents = 'explore_contents',
}

export const AGENCY_COLLABORATOR_ONBOARDING_STEP_ORDER: AgencyCollaboratorOnboardingStep[] = [
    AgencyCollaboratorOnboardingStep.ExploreProjects,
    AgencyCollaboratorOnboardingStep.ExploreContents,
]

export const agencyCollaboratorOnboardingStepTranslationKeys: Record<AgencyCollaboratorOnboardingStep, string> = {
    [AgencyCollaboratorOnboardingStep.ExploreProjects]: "enums:onboardingStep.collaborator.titles.exploreProjects",
    [AgencyCollaboratorOnboardingStep.ExploreContents]: "enums:onboardingStep.collaborator.titles.exploreContents",
}

export const agencyCollaboratorOnboardingStepDescriptionKeys: Record<AgencyCollaboratorOnboardingStep, string> = {
    [AgencyCollaboratorOnboardingStep.ExploreProjects]: "enums:onboardingStep.collaborator.descriptions.exploreProjects",
    [AgencyCollaboratorOnboardingStep.ExploreContents]: "enums:onboardingStep.collaborator.descriptions.exploreContents",
}

export const agencyCollaboratorOnboardingStepShortLabelKeys: Record<AgencyCollaboratorOnboardingStep, string> = {
    [AgencyCollaboratorOnboardingStep.ExploreProjects]: "enums:onboardingStep.collaborator.shortLabels.exploreProjects",
    [AgencyCollaboratorOnboardingStep.ExploreContents]: "enums:onboardingStep.collaborator.shortLabels.exploreContents",
}

export const agencyCollaboratorOnboardingStepToIcon: Record<AgencyCollaboratorOnboardingStep, ComponentType<SVGProps<SVGSVGElement>>> = {
    [AgencyCollaboratorOnboardingStep.ExploreProjects]: FolderOpenIcon,
    [AgencyCollaboratorOnboardingStep.ExploreContents]: DocumentTextIcon,
}

export const agencyCollaboratorOnboardingStepToNavigateTo: Partial<Record<AgencyCollaboratorOnboardingStep, string>> = {
    [AgencyCollaboratorOnboardingStep.ExploreProjects]: agencyHomePath,
    [AgencyCollaboratorOnboardingStep.ExploreContents]: agencyContentsPath,
}
