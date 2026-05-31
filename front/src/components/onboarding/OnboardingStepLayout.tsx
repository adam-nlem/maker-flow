import type { ReactNode } from "react"
import OnboardingProgressBar from "./OnboardingProgressBar"
import { useTranslation } from "react-i18next"
import { useOnboardingFlow } from "~/hooks/useOnboardingFlow"

interface OnboardingStepLayoutProps {
  children: ReactNode
}

export default function OnboardingStepLayout({
  children,
}: OnboardingStepLayoutProps) {
  const { t } = useTranslation()
  const { currentStepConfig } = useOnboardingFlow()

  if (!currentStepConfig) {
    return null
  }

  return (
    <div className="h-1/2 w-1/2 flex flex-col justify-center items-start py-5 px-30">
      <OnboardingProgressBar />
      <h2 className="text-heading-3xl text-dark mt-10 ">
        {t(currentStepConfig.titleKey)}
      </h2>
      <p className="text-body-sm text-muted-2 mt-2 ">
        {t(currentStepConfig.descriptionKey)}
      </p>

      <div className="mt-20 bg-clear w-full flex flex-col items-center justify-center">
        {children}
      </div>
    </div>

  )
}
