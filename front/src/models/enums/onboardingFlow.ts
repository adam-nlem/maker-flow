import type { ComponentType, SVGProps } from "react"

import {
    AGENCY_ADMIN_ONBOARDING_STEP_ORDER,
    AgencyAdminOnboardingStep,
    agencyAdminOnboardingStepDescriptionKeys,
    agencyAdminOnboardingStepShortLabelKeys,
    agencyAdminOnboardingStepToIcon,
    agencyAdminOnboardingStepToNavigateTo,
    agencyAdminOnboardingStepTranslationKeys,
} from "./AgencyAdminOnboardingStep"
import {
    AGENCY_COLLABORATOR_ONBOARDING_STEP_ORDER,
    AgencyCollaboratorOnboardingStep,
    agencyCollaboratorOnboardingStepDescriptionKeys,
    agencyCollaboratorOnboardingStepShortLabelKeys,
    agencyCollaboratorOnboardingStepToIcon,
    agencyCollaboratorOnboardingStepToNavigateTo,
    agencyCollaboratorOnboardingStepTranslationKeys,
} from "./AgencyCollaboratorOnboardingStep"
import {
    CLIENT_ONBOARDING_STEP_ORDER,
    ClientOnboardingStep,
    clientOnboardingStepDescriptionKeys,
    clientOnboardingStepShortLabelKeys,
    clientOnboardingStepToIcon,
    clientOnboardingStepToNavigateTo,
    clientOnboardingStepTranslationKeys,
} from "./ClientOnboardingStep"
import { UserRole } from "./UserRole"

export type OnboardingStepValue =
    | AgencyAdminOnboardingStep
    | AgencyCollaboratorOnboardingStep
    | ClientOnboardingStep

export interface OnboardingFlowConfig {
    order: OnboardingStepValue[]
    translationKeys: Record<string, string>
    descriptionKeys: Record<string, string>
    shortLabelKeys: Record<string, string>
    icons: Record<string, ComponentType<SVGProps<SVGSVGElement>>>
    navigateTo: Partial<Record<string, string>>
}

const adminConfig: OnboardingFlowConfig = {
    order: AGENCY_ADMIN_ONBOARDING_STEP_ORDER,
    translationKeys: agencyAdminOnboardingStepTranslationKeys,
    descriptionKeys: agencyAdminOnboardingStepDescriptionKeys,
    shortLabelKeys: agencyAdminOnboardingStepShortLabelKeys,
    icons: agencyAdminOnboardingStepToIcon,
    navigateTo: agencyAdminOnboardingStepToNavigateTo,
}

const collaboratorConfig: OnboardingFlowConfig = {
    order: AGENCY_COLLABORATOR_ONBOARDING_STEP_ORDER,
    translationKeys: agencyCollaboratorOnboardingStepTranslationKeys,
    descriptionKeys: agencyCollaboratorOnboardingStepDescriptionKeys,
    shortLabelKeys: agencyCollaboratorOnboardingStepShortLabelKeys,
    icons: agencyCollaboratorOnboardingStepToIcon,
    navigateTo: agencyCollaboratorOnboardingStepToNavigateTo,
}

const clientConfig: OnboardingFlowConfig = {
    order: CLIENT_ONBOARDING_STEP_ORDER,
    translationKeys: clientOnboardingStepTranslationKeys,
    descriptionKeys: clientOnboardingStepDescriptionKeys,
    shortLabelKeys: clientOnboardingStepShortLabelKeys,
    icons: clientOnboardingStepToIcon,
    navigateTo: clientOnboardingStepToNavigateTo,
}

export function getOnboardingFlowConfig(role: UserRole | null): OnboardingFlowConfig {
    if (role === UserRole.Client) {
        return clientConfig
    }

    if (role === UserRole.Editor || role === UserRole.Viewer) {
        return collaboratorConfig
    }

    return adminConfig
}
