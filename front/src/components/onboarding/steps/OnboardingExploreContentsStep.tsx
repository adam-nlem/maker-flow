import { ChevronRightIcon, DocumentTextIcon } from "@heroicons/react/24/outline"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import { Button } from "~/components/ui/Button"
import OnboardingStepLayout from "~/components/onboarding/OnboardingStepLayout"
import SimpleTextButton from "~/components/ui/SimpleTextButton"
import { useAdvanceOnboardingStep } from "~/hooks/api/onboarding/useAdvanceOnboardingStep"
import { clientContentsPath } from "~/routes/routePaths"

export default function OnboardingExploreContentsStep() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { advanceStep } = useAdvanceOnboardingStep()

  const handleNavigate = async () => {
    await advanceStep()
    navigate(clientContentsPath)
  }

  return (
    <OnboardingStepLayout
      children={
        <div className="flex flex-col items-center gap-5 w-full">
          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
            <DocumentTextIcon className="size-8 text-primary" />
          </div>

          <p className="text-body-md text-dark text-center">
            {t("onboarding:exploreContents.body")}
          </p>

          <Button type="button" style="primary" onClick={handleNavigate}>
            <div className="flex flex-row justify-center items-center gap-3">
              <p className="text-sm">{t("onboarding:exploreContents.cta")}</p>
              <ChevronRightIcon className="size-4" strokeWidth={2} />
            </div>
          </Button>

          <SimpleTextButton onClick={advanceStep}>
            {t("onboarding:exploreContents.skip")}
          </SimpleTextButton>
        </div>
      }
    />
  )
}
