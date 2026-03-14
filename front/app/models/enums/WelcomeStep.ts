import { SparklesIcon, ListBulletIcon } from "@heroicons/react/24/outline"
import type { ComponentType, SVGProps } from "react"

export enum WelcomeStep {
    Features = 'features',
    HowItWorks = 'how_it_works',
}

export const WELCOME_STEP_ORDER = [
    WelcomeStep.Features,
    WelcomeStep.HowItWorks,
]

export const welcomeStepToIcon: Record<WelcomeStep, ComponentType<SVGProps<SVGSVGElement>>> = {
    [WelcomeStep.Features]: SparklesIcon,
    [WelcomeStep.HowItWorks]: ListBulletIcon,
}

export const welcomeStepToShortLabel: Record<WelcomeStep, string> = {
    [WelcomeStep.Features]: "Fonctionnalités",
    [WelcomeStep.HowItWorks]: "Guide",
}
