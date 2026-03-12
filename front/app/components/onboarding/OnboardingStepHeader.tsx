import { useAdvanceOnboardingStep } from "~/hooks/api/onboarding/useAdvanceOnboardingStep"
import { useOnboardingFlow } from "~/hooks/useOnboardingFlow"
import { useOnboardingStore } from "~/stores/onboarding/onboardingStore"
import { onboardingStepToFrenchTranslation, onboardingStepToDescription } from "~/models/enums/OnboardingStep"
import { welcomeStepToTitle, welcomeStepToDescription, WelcomeStep } from "~/models/enums/WelcomeStep"
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
        <>
            <div className="fixed top-0 left-0 right-0 flex items-center justify-center p-5">
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

            <div className="mb-8 flex flex-col gap-2 items-center text-center">
                <h2 className="text-heading-3xl text-dark">
                    {onboardingStepToFrenchTranslation[currentOnboardingStep]}
                </h2>
                <p className="text-body-sm text-gray">
                    {onboardingStepToDescription[currentOnboardingStep]}
                </p>
            </div>
        </>
    )
}
