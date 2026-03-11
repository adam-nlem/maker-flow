import { FolderPlusIcon, LinkIcon, DocumentTextIcon, SparklesIcon } from "@heroicons/react/24/outline"
import type { ComponentType, SVGProps } from "react"

export enum OnboardingStep {
    CreateFirstProject = 'create_first_project',
    ConnectIntegration = 'connect_integration',
    CreateFirstScript = 'create_first_script',
    ShowSubscriptions = 'show_subscriptions',
}

export const onboardingStepOptions = Object.values(OnboardingStep);

export const onboardingStepToFrenchTranslation: Record<OnboardingStep, string> = {
    [OnboardingStep.CreateFirstProject]: "Créez votre premier projet",
    [OnboardingStep.ConnectIntegration]: "Connectez un réseau social",
    [OnboardingStep.CreateFirstScript]: "Créez votre premier script",
    [OnboardingStep.ShowSubscriptions]: "Découvrez les abonnements",
}

export const onboardingStepToDescription: Record<OnboardingStep, string> = {
    [OnboardingStep.CreateFirstProject]: "Les projets regroupent vos scripts, analytics et intégrations.",
    [OnboardingStep.ConnectIntegration]: "Liez votre compte Instagram ou YouTube pour suivre vos performances.",
    [OnboardingStep.CreateFirstScript]: "Rédigez et organisez vos contenus vidéo étape par étape.",
    [OnboardingStep.ShowSubscriptions]: "Explorez les fonctionnalités premium disponibles.",
}

export const onboardingStepToIcon: Record<OnboardingStep, ComponentType<SVGProps<SVGSVGElement>>> = {
    [OnboardingStep.CreateFirstProject]: FolderPlusIcon,
    [OnboardingStep.ConnectIntegration]: LinkIcon,
    [OnboardingStep.CreateFirstScript]: DocumentTextIcon,
    [OnboardingStep.ShowSubscriptions]: SparklesIcon,
}

export const onboardingStepToActionLabel: Record<OnboardingStep, string> = {
    [OnboardingStep.CreateFirstProject]: "Créer un projet",
    [OnboardingStep.ConnectIntegration]: "Connecter",
    [OnboardingStep.CreateFirstScript]: "Créer un script",
    [OnboardingStep.ShowSubscriptions]: "Voir les offres",
}

export const onboardingStepToNavigateTo: Partial<Record<OnboardingStep, string>> = {
    [OnboardingStep.ConnectIntegration]: "/settings/integrations",
    [OnboardingStep.CreateFirstScript]: "/scripts",
    [OnboardingStep.ShowSubscriptions]: "/settings/subscription",
}
