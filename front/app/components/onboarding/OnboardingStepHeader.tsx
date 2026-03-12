import { useAdvanceOnboardingStep } from "~/hooks/api/onboarding/useAdvanceOnboardingStep"
import { useOnboardingFlow } from "~/hooks/useOnboardingFlow"
import { onboardingStepToFrenchTranslation, onboardingStepToDescription } from "~/models/enums/OnboardingStep"
import { Button } from "../ui/Button"
import { ArrowRightIcon } from "@heroicons/react/24/outline"
import OnboardingProgressBar from "./OnboardingProgressBar"

interface OnboardingStepHeaderProps {
    disableNextButton?: boolean
}

export default function OnboardingStepHeader({ disableNextButton }: OnboardingStepHeaderProps) {
    const { advanceStep } = useAdvanceOnboardingStep()
    const { currentOnboardingStep } = useOnboardingFlow()

    return (
        <div className="flex flex-col items-center w-full mb-5">
            <div className="flex items-center justify-center w-full mb-5">
                <div className="flex-1" />
                <OnboardingProgressBar />
                <div className="flex-1 flex justify-end">
                    <Button style="primary" onClick={advanceStep} disabled={disableNextButton} width="w-fit">
                        <div className="flex flex-row justify-center items-center gap-3">
                            <p className="text-sm">Continuer</p>
                            <ArrowRightIcon className="size-4 text-clear" strokeWidth={2} />
                        </div>
                    </Button>
                </div>
            </div>

            <h2 className="text-heading-3xl text-dark mb-2 text-center">
                {onboardingStepToFrenchTranslation[currentOnboardingStep]}
            </h2>
            <p className="text-body-sm text-gray text-center">
                {onboardingStepToDescription[currentOnboardingStep]}
            </p>
        </div>
    )
}
