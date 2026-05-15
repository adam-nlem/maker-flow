import { useTranslation } from "react-i18next"
import { useOnboardingFlow } from "~/hooks/useOnboardingFlow"
import OnboardingProgressBar from "./OnboardingProgressBar"

export default function OnboardingStepHeader() {
    const { t } = useTranslation()
    const { currentOnboardingStep, flowConfig } = useOnboardingFlow()

    return (
        <div className="flex flex-col gap-5 items-center w-full mb-5">
            <OnboardingProgressBar />

            <h2 className="text-heading-3xl text-dark mb-2 text-center">
                {t(flowConfig.translationKeys[currentOnboardingStep])}
            </h2>
            <p className="text-body-sm text-muted-2 text-center">
                {t(flowConfig.descriptionKeys[currentOnboardingStep])}
            </p>
        </div>
    )
}
