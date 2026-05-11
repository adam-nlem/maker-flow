import { BuildingOffice2Icon, FolderPlusIcon, LinkIcon, DocumentPlusIcon, SparklesIcon } from "@heroicons/react/24/outline"
import type { ComponentType, SVGProps } from "react"

export enum OnboardingStep {
    CreateAgency = 'create_agency',
    CreateFirstProject = 'create_first_project',
    ConnectIntegration = 'connect_integration',
    CreateFirstScript = 'create_first_script',
    GenerateFirstScript = 'generate_first_script',
    ShowSubscriptions = 'show_subscriptions',
}

export const onboardingStepOptions = Object.values(OnboardingStep);

export const ONBOARDING_STEP_ORDER = [
    OnboardingStep.CreateAgency,
    OnboardingStep.CreateFirstProject,
    OnboardingStep.ConnectIntegration,
    OnboardingStep.CreateFirstScript,
    OnboardingStep.GenerateFirstScript,
    OnboardingStep.ShowSubscriptions,
]

export const onboardingStepTranslationKeys: Record<OnboardingStep, string> = {
    [OnboardingStep.CreateAgency]: "enums:onboardingStep.titles.createAgency",
    [OnboardingStep.CreateFirstProject]: "enums:onboardingStep.titles.createFirstProject",
    [OnboardingStep.ConnectIntegration]: "enums:onboardingStep.titles.connectIntegration",
    [OnboardingStep.CreateFirstScript]: "enums:onboardingStep.titles.createFirstScript",
    [OnboardingStep.GenerateFirstScript]: "enums:onboardingStep.titles.generateFirstScript",
    [OnboardingStep.ShowSubscriptions]: "enums:onboardingStep.titles.showSubscriptions",
}

export const onboardingStepDescriptionKeys: Record<OnboardingStep, string> = {
    [OnboardingStep.CreateAgency]: "enums:onboardingStep.descriptions.createAgency",
    [OnboardingStep.CreateFirstProject]: "enums:onboardingStep.descriptions.createFirstProject",
    [OnboardingStep.ConnectIntegration]: "enums:onboardingStep.descriptions.connectIntegration",
    [OnboardingStep.CreateFirstScript]: "enums:onboardingStep.descriptions.createFirstScript",
    [OnboardingStep.GenerateFirstScript]: "enums:onboardingStep.descriptions.generateFirstScript",
    [OnboardingStep.ShowSubscriptions]: "enums:onboardingStep.descriptions.showSubscriptions",
}

export const onboardingStepToIcon: Record<OnboardingStep, ComponentType<SVGProps<SVGSVGElement>>> = {
    [OnboardingStep.CreateAgency]: BuildingOffice2Icon,
    [OnboardingStep.CreateFirstProject]: FolderPlusIcon,
    [OnboardingStep.ConnectIntegration]: LinkIcon,
    [OnboardingStep.CreateFirstScript]: DocumentPlusIcon,
    [OnboardingStep.GenerateFirstScript]: SparklesIcon,
    [OnboardingStep.ShowSubscriptions]: SparklesIcon,
}

export const onboardingStepShortLabelKeys: Record<OnboardingStep, string> = {
    [OnboardingStep.CreateAgency]: "enums:onboardingStep.shortLabels.createAgency",
    [OnboardingStep.CreateFirstProject]: "enums:onboardingStep.shortLabels.createFirstProject",
    [OnboardingStep.ConnectIntegration]: "enums:onboardingStep.shortLabels.connectIntegration",
    [OnboardingStep.CreateFirstScript]: "enums:onboardingStep.shortLabels.createFirstScript",
    [OnboardingStep.GenerateFirstScript]: "enums:onboardingStep.shortLabels.generateFirstScript",
    [OnboardingStep.ShowSubscriptions]: "enums:onboardingStep.shortLabels.showSubscriptions",
}

export const onboardingStepToNavigateTo: Partial<Record<OnboardingStep, string>> = {
    [OnboardingStep.ConnectIntegration]: "/settings/integrations",
    [OnboardingStep.ShowSubscriptions]: "/settings/subscription",
}
