import { CheckCircleIcon, ChevronRightIcon } from "@heroicons/react/24/solid"

import { useShowOnboarding } from "~/hooks/api/onboarding/useShowOnboarding"
import { useOnboardingFlow } from "~/hooks/useOnboardingFlow"
import { ONBOARDING_STEP_ORDER, onboardingStepToIcon, onboardingStepToShortLabel } from "~/models/enums/OnboardingStep"

export default function OnboardingProgressBar() {
    const { onboarding } = useShowOnboarding()
    const { currentOnboardingStep } = useOnboardingFlow()

    return (
        <div className="flex items-center gap-2">
            {ONBOARDING_STEP_ORDER.map((step, index) => {
                const isCompleted = onboarding?.isStepCompleted(step) ?? false
                const isCurrent = step === currentOnboardingStep
                const Icon = onboardingStepToIcon[step]

                return (
                    <div key={step} className="flex items-center gap-2">
                        {index > 0 && (
                            <ChevronRightIcon className="size-4 text-gray shrink-0" />
                        )}

                        <div className="flex items-center gap-1.5 shrink-0">
                                <Icon className={`size-5 shrink-0 ${isCompleted ? 'text-primary' : 'text-gray'}`} />
                            <span className={`text-body-xs whitespace-nowrap ${isCurrent ? 'text-dark ' : isCompleted ? 'text-dark' : 'text-gray'}`}>
                                {onboardingStepToShortLabel[step]}
                            </span>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
