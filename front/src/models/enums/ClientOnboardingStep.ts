import { DocumentTextIcon, HandRaisedIcon, LinkIcon } from "@heroicons/react/24/outline"
import type { ComponentType, SVGProps } from "react"

import { clientContentsPath, clientHomePath } from "~/routes/routePaths"

export enum ClientOnboardingStep {
    WelcomeTour = 'welcome_tour',
    ConnectFirstIntegration = 'connect_first_integration',
    ExploreContents = 'explore_contents',
}

export const CLIENT_ONBOARDING_STEP_ORDER: ClientOnboardingStep[] = [
    ClientOnboardingStep.WelcomeTour,
    ClientOnboardingStep.ConnectFirstIntegration,
    ClientOnboardingStep.ExploreContents,
]

export const clientOnboardingStepTranslationKeys: Record<ClientOnboardingStep, string> = {
    [ClientOnboardingStep.WelcomeTour]: "enums:onboardingStep.client.titles.welcomeTour",
    [ClientOnboardingStep.ConnectFirstIntegration]: "enums:onboardingStep.client.titles.connectFirstIntegration",
    [ClientOnboardingStep.ExploreContents]: "enums:onboardingStep.client.titles.exploreContents",
}

export const clientOnboardingStepDescriptionKeys: Record<ClientOnboardingStep, string> = {
    [ClientOnboardingStep.WelcomeTour]: "enums:onboardingStep.client.descriptions.welcomeTour",
    [ClientOnboardingStep.ConnectFirstIntegration]: "enums:onboardingStep.client.descriptions.connectFirstIntegration",
    [ClientOnboardingStep.ExploreContents]: "enums:onboardingStep.client.descriptions.exploreContents",
}

export const clientOnboardingStepShortLabelKeys: Record<ClientOnboardingStep, string> = {
    [ClientOnboardingStep.WelcomeTour]: "enums:onboardingStep.client.shortLabels.welcomeTour",
    [ClientOnboardingStep.ConnectFirstIntegration]: "enums:onboardingStep.client.shortLabels.connectFirstIntegration",
    [ClientOnboardingStep.ExploreContents]: "enums:onboardingStep.client.shortLabels.exploreContents",
}

export const clientOnboardingStepToIcon: Record<ClientOnboardingStep, ComponentType<SVGProps<SVGSVGElement>>> = {
    [ClientOnboardingStep.WelcomeTour]: HandRaisedIcon,
    [ClientOnboardingStep.ConnectFirstIntegration]: LinkIcon,
    [ClientOnboardingStep.ExploreContents]: DocumentTextIcon,
}

export const clientOnboardingStepToNavigateTo: Partial<Record<ClientOnboardingStep, string>> = {
    [ClientOnboardingStep.ConnectFirstIntegration]: clientHomePath,
    [ClientOnboardingStep.ExploreContents]: clientContentsPath,
}
