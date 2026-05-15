import { ChevronRightIcon } from "@heroicons/react/24/solid"
import { useTranslation } from "react-i18next"
import { useIsDesktop } from "~/hooks/useIsDesktop"
import { useOnboardingFlow } from "~/hooks/useOnboardingFlow"
import { WELCOME_STEP_ORDER, welcomeStepToIcon, welcomeStepShortLabelKeys } from "~/models/enums/WelcomeStep"

export default function OnboardingProgressBar() {
    const { t } = useTranslation()
    const { isAuthenticated, onboarding, currentOnboardingStep, currentWelcomeStep, currentStep, totalSteps, flowConfig } = useOnboardingFlow()
    const isDesktop = useIsDesktop()

    const steps: string[] = isAuthenticated ? flowConfig.order : WELCOME_STEP_ORDER
    const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = isAuthenticated ? flowConfig.icons : welcomeStepToIcon
    const labelMap: Record<string, string> = isAuthenticated ? flowConfig.shortLabelKeys : welcomeStepShortLabelKeys

    const currentWelcomeIndex = WELCOME_STEP_ORDER.indexOf(currentWelcomeStep)

    const isCompleted = (step: string, index: number) =>
        isAuthenticated
            ? onboarding?.isStepCompleted(step) ?? false
            : index < currentWelcomeIndex

    const isCurrent = (step: string) =>
        isAuthenticated
            ? step === currentOnboardingStep
            : step === currentWelcomeStep

    const percentage = Math.round(((currentStep + 1) / totalSteps) * 100)
    const currentStepKey = steps[currentStep]

    if (!isDesktop) {
        return (
            <div className="flex flex-col gap-1 w-full">
                <div className="flex items-center justify-between">
                    <span className="text-body-xs text-muted-2 uppercase">
                        {t("onboarding:progress.stepCount", { current: currentStep + 1, total: totalSteps })}
                    </span>
                    <span className="text-body-xs text-muted-2">
                        {percentage}%
                    </span>
                </div>
                <span className="text-body-sm text-dark font-semibold">
                    {t(labelMap[currentStepKey])}
                </span>
                <div className="h-1.5 w-full bg-pale-gray-2 rounded-full">
                    <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2">
            {steps.map((step, index) => {
                const completed = isCompleted(step, index)
                const current = isCurrent(step)
                const Icon = iconMap[step]

                return (
                    <div key={step} className="flex items-center gap-2">
                        {index > 0 && (
                            <ChevronRightIcon className="size-4 text-muted-2 shrink-0" />
                        )}
                        <div className="flex flex-col gap-1">

                            <div className="flex items-center gap-1.5 shrink-0">
                                <Icon className={`size-5 shrink-0 ${completed ? 'text-primary' : 'text-muted-2'}`} />
                                <span className={`text-body-xs whitespace-nowrap ${current ? 'text-dark' : completed ? 'text-dark' : 'text-muted-2'}`}>
                                    {t(labelMap[step])}
                                </span>
                            </div>
                        </div>

                    </div>
                )
            })}
        </div>
    )
}
