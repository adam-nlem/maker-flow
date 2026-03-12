import { FolderPlusIcon, LinkIcon, UserCircleIcon, DocumentPlusIcon, SparklesIcon } from "@heroicons/react/24/outline"
import type { ComponentType, SVGProps } from "react"

export enum OnboardingStep {
    CreateFirstProject = 'create_first_project',
    ConnectIntegration = 'connect_integration',
    CreateCreatorProfile = 'create_creator_profile',
    CreateFirstScript = 'create_first_script',
    GenerateFirstScript = 'generate_first_script',
    ShowSubscriptions = 'show_subscriptions',
}

export const onboardingStepOptions = Object.values(OnboardingStep);

export const ONBOARDING_STEP_ORDER = [
    OnboardingStep.CreateFirstProject,
    OnboardingStep.ConnectIntegration,
    OnboardingStep.CreateCreatorProfile,
    OnboardingStep.CreateFirstScript,
    OnboardingStep.GenerateFirstScript,
    OnboardingStep.ShowSubscriptions,
]

export const onboardingStepToFrenchTranslation: Record<OnboardingStep, string> = {
    [OnboardingStep.CreateFirstProject]: "Créez votre premier projet",
    [OnboardingStep.ConnectIntegration]: "Connectez un réseau social",
    [OnboardingStep.CreateCreatorProfile]: "Configurez votre profil créateur",
    [OnboardingStep.CreateFirstScript]: "Créez votre premier script",
    [OnboardingStep.GenerateFirstScript]: "Générez votre premier script",
    [OnboardingStep.ShowSubscriptions]: "Découvrez les abonnements",
}

export const onboardingStepToDescription: Record<OnboardingStep, string> = {
    [OnboardingStep.CreateFirstProject]: "Les projets regroupent vos scripts, analytics et intégrations.",
    [OnboardingStep.ConnectIntegration]: "Liez votre compte Instagram ou YouTube pour suivre vos performances.",
    [OnboardingStep.CreateCreatorProfile]: "Personnalisez l'IA pour qu'elle s'adapte à votre style et votre audience.",
    [OnboardingStep.CreateFirstScript]: "Définissez le sujet et les plateformes de votre premier script vidéo.",
    [OnboardingStep.GenerateFirstScript]: "Créez un script vidéo généré par l'IA en quelques clics.",
    [OnboardingStep.ShowSubscriptions]: "Explorez les fonctionnalités premium disponibles.",
}

export const onboardingStepToIcon: Record<OnboardingStep, ComponentType<SVGProps<SVGSVGElement>>> = {
    [OnboardingStep.CreateFirstProject]: FolderPlusIcon,
    [OnboardingStep.ConnectIntegration]: LinkIcon,
    [OnboardingStep.CreateCreatorProfile]: UserCircleIcon,
    [OnboardingStep.CreateFirstScript]: DocumentPlusIcon,
    [OnboardingStep.GenerateFirstScript]: SparklesIcon,
    [OnboardingStep.ShowSubscriptions]: SparklesIcon,
}

export const onboardingStepToActionLabel: Record<OnboardingStep, string> = {
    [OnboardingStep.CreateFirstProject]: "Créer un projet",
    [OnboardingStep.ConnectIntegration]: "Connecter",
    [OnboardingStep.CreateCreatorProfile]: "Configurer",
    [OnboardingStep.CreateFirstScript]: "Créer",
    [OnboardingStep.GenerateFirstScript]: "Générer",
    [OnboardingStep.ShowSubscriptions]: "Voir les offres",
}

export const onboardingStepToNavigateTo: Partial<Record<OnboardingStep, string>> = {
    [OnboardingStep.ConnectIntegration]: "/settings/integrations",
    [OnboardingStep.ShowSubscriptions]: "/settings/subscription",
}
