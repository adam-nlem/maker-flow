import { ChevronRightIcon } from "@heroicons/react/24/solid"

import { useOnboardingFlow } from "~/hooks/useOnboardingFlow"
import { type OnboardingStep, ONBOARDING_STEP_ORDER, onboardingStepToIcon, onboardingStepToShortLabel } from "~/models/enums/OnboardingStep"
import { WELCOME_STEP_ORDER, welcomeStepToIcon, welcomeStepToShortLabel } from "~/models/enums/WelcomeStep"

export default function OnboardingProgressBar() {
    const { isAuthenticated, onboarding, currentOnboardingStep, currentWelcomeStep } = useOnboardingFlow()

    const steps = isAuthenticated ? ONBOARDING_STEP_ORDER : WELCOME_STEP_ORDER
    const iconMap = isAuthenticated ? onboardingStepToIcon : welcomeStepToIcon
    const labelMap = isAuthenticated ? onboardingStepToShortLabel : welcomeStepToShortLabel

    const currentWelcomeIndex = WELCOME_STEP_ORDER.indexOf(currentWelcomeStep)

    const isCompleted = (step: string, index: number) =>
        isAuthenticated
            ? onboarding?.isStepCompleted(step as OnboardingStep) ?? false
            : index < currentWelcomeIndex

    const isCurrent = (step: string) =>
        isAuthenticated
            ? step === currentOnboardingStep
            : step === currentWelcomeStep

    return (
        <div className="flex items-center gap-2">
            {steps.map((step, index) => {
                const completed = isCompleted(step, index)
                const current = isCurrent(step)
                const Icon = iconMap[step as keyof typeof iconMap] as React.ComponentType<React.SVGProps<SVGSVGElement>>

                return (
                    <div key={step} className="flex items-center gap-2">
                        {index > 0 && (
                            <ChevronRightIcon className="size-4 text-gray shrink-0" />
                        )}

                        <div className="flex items-center gap-1.5 shrink-0">
                            <Icon className={`size-5 shrink-0 ${completed ? 'text-primary' : 'text-gray'}`} />
                            <span className={`text-body-xs whitespace-nowrap ${current ? 'text-dark' : completed ? 'text-dark' : 'text-gray'}`}>
                                {labelMap[step as keyof typeof labelMap]}
                            </span>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
