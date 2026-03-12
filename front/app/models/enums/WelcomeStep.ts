import { SparklesIcon, ListBulletIcon, UserPlusIcon, EnvelopeIcon } from "@heroicons/react/24/outline"
import type { ComponentType, SVGProps } from "react"

export enum WelcomeStep {
    Features = 'features',
    HowItWorks = 'how_it_works',
    Register = 'register',
    VerifyOtp = 'verify_otp',
}

export const WELCOME_STEP_ORDER = [
    WelcomeStep.Features,
    WelcomeStep.HowItWorks,
    WelcomeStep.Register,
    WelcomeStep.VerifyOtp,
]

export const welcomeStepToTitle: Partial<Record<WelcomeStep, string>> = {
    [WelcomeStep.Register]: "Créez votre compte",
    [WelcomeStep.VerifyOtp]: "Vérification de l'email",
}

export const welcomeStepToDescription: Partial<Record<WelcomeStep, string>> = {
    [WelcomeStep.Register]: "Commencez gratuitement et gérez vos contenus dès maintenant.",
}

export const welcomeStepToIcon: Record<WelcomeStep, ComponentType<SVGProps<SVGSVGElement>>> = {
    [WelcomeStep.Features]: SparklesIcon,
    [WelcomeStep.HowItWorks]: ListBulletIcon,
    [WelcomeStep.Register]: UserPlusIcon,
    [WelcomeStep.VerifyOtp]: EnvelopeIcon,
}

export const welcomeStepToShortLabel: Record<WelcomeStep, string> = {
    [WelcomeStep.Features]: "Fonctionnalités",
    [WelcomeStep.HowItWorks]: "Guide",
    [WelcomeStep.Register]: "Inscription",
    [WelcomeStep.VerifyOtp]: "Vérification",
}
