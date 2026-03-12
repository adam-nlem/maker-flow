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
    [OnboardingStep.ConnectIntegration]: "Connectez vos réseaux sociaux",
    [OnboardingStep.CreateCreatorProfile]: "Personnalisez votre compte créateur",
    [OnboardingStep.CreateFirstScript]: "Créez votre premier script",
    [OnboardingStep.GenerateFirstScript]: "Générez votre premier script",
    [OnboardingStep.ShowSubscriptions]: "Découvrez nos offres",
}

export const onboardingStepToDescription: Record<OnboardingStep, string> = {
    [OnboardingStep.CreateFirstProject]: "Les projets vous permettent de regrouper vos contenus et vos réseaux sociaux.",
    [OnboardingStep.ConnectIntegration]: "Connectez vos comptes pour analyser vos performances et centraliser vos contenus.",
    [OnboardingStep.CreateCreatorProfile]: "Ces informations permettent à l'IA de s'adapter à votre style.",
    [OnboardingStep.CreateFirstScript]: "Voici votre premier script vidéo. Vous pourrez le modifier plus tard.",
    [OnboardingStep.GenerateFirstScript]: "L'IA va créer un script vidéo complet basé sur vos indications.",
    [OnboardingStep.ShowSubscriptions]: "Choisissez l'abonnement qui correspond à vos besoins pour débloquer toutes les fonctionnalités.",
}

export const onboardingStepToIcon: Record<OnboardingStep, ComponentType<SVGProps<SVGSVGElement>>> = {
    [OnboardingStep.CreateFirstProject]: FolderPlusIcon,
    [OnboardingStep.ConnectIntegration]: LinkIcon,
    [OnboardingStep.CreateCreatorProfile]: UserCircleIcon,
    [OnboardingStep.CreateFirstScript]: DocumentPlusIcon,
    [OnboardingStep.GenerateFirstScript]: SparklesIcon,
    [OnboardingStep.ShowSubscriptions]: SparklesIcon,
}

export const onboardingStepToShortLabel: Record<OnboardingStep, string> = {
    [OnboardingStep.CreateFirstProject]: "Projet",
    [OnboardingStep.ConnectIntegration]: "Réseau social",
    [OnboardingStep.CreateCreatorProfile]: "Profil créateur",
    [OnboardingStep.CreateFirstScript]: "Script",
    [OnboardingStep.GenerateFirstScript]: "Génération",
    [OnboardingStep.ShowSubscriptions]: "Abonnements",
}

export const onboardingStepToNavigateTo: Partial<Record<OnboardingStep, string>> = {
    [OnboardingStep.ConnectIntegration]: "/settings/integrations",
    [OnboardingStep.ShowSubscriptions]: "/settings/subscription",
}
