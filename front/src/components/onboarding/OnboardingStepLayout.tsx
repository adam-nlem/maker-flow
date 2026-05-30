import type { ReactNode } from "react"
import OnboardingProgressBar from "./OnboardingProgressBar"
import { useTranslation } from "react-i18next"
import { useOnboardingFlow } from "~/hooks/useOnboardingFlow"

interface OnboardingStepLayoutProps {
  maxWidth?: string
  left: ReactNode
  right?: ReactNode
}

export default function OnboardingStepLayout({
  maxWidth = "max-w-lg",
  left,
  right,
}: OnboardingStepLayoutProps) {
  const { t } = useTranslation()
  const { currentOnboardingStep, flowConfig } = useOnboardingFlow()

  return (
    <div className="flex flex-row gap-3 h-screen items-center">
      <div className="h-1/2 w-1/2 flex flex-col justify-center items-center p-5">
        <OnboardingProgressBar />
        <div className="w-fit">
          <h2 className="text-heading-3xl text-dark mt-10 text-start">
            {t(flowConfig.translationKeys[currentOnboardingStep])}
          </h2>
          <p className="text-body-sm text-muted-2 mt-2 text-start">

            {t(flowConfig.descriptionKeys[currentOnboardingStep])}
          </p>

          <div className={`${maxWidth} mt-20 bg-clear flex flex-col items-center justify-center`}>
            {left}
          </div>
        </div>

      </div>

      {right && (
        <div className="h-screen w-1/2 flex flex-col justify-center items-center p-5">
          {right}
        </div>
      )}
    </div>
  )
}
