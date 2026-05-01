import { useTranslation } from "react-i18next"
import { useOnboardingFlow } from "~/hooks/useOnboardingFlow"
import { onboardingStepTranslationKeys, onboardingStepDescriptionKeys } from "~/models/enums/OnboardingStep"
import OnboardingProgressBar from "./OnboardingProgressBar"

export default function OnboardingStepHeader() {
    const { t } = useTranslation()
    const { currentOnboardingStep } = useOnboardingFlow()

    return (
        <div className="flex flex-col gap-5 items-center w-full mb-5">
            <OnboardingProgressBar />

            <h2 className="text-heading-3xl text-dark mb-2 text-center">
                {t(onboardingStepTranslationKeys[currentOnboardingStep])}
            </h2>
            <p className="text-body-sm text-gray text-center">
                {t(onboardingStepDescriptionKeys[currentOnboardingStep])}
            </p>
        </div>
    )
}
