import { ChevronRightIcon, FolderOpenIcon } from "@heroicons/react/24/outline"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import { Button } from "~/components/ui/Button"
import OnboardingStepLayout from "~/components/onboarding/OnboardingStepLayout"
import SimpleTextButton from "~/components/ui/SimpleTextButton"
import { useAdvanceOnboardingStep } from "~/hooks/api/onboarding/useAdvanceOnboardingStep"
import { agencyHomePath } from "~/routes/routePaths"

export default function OnboardingExploreProjectsStep() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { advanceStep } = useAdvanceOnboardingStep()

    const handleNavigate = async () => {
        await advanceStep()
        navigate(agencyHomePath)
    }

    return (
        <OnboardingStepLayout
            maxWidth="max-w-md"
            left={
            <div className="flex flex-col items-center gap-5 w-full">
                <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <FolderOpenIcon className="size-8 text-primary" />
                </div>

                <p className="text-body-md text-dark text-center">
                    {t("onboarding:exploreProjects.body")}
                </p>

                <Button type="button" style="primary" onClick={handleNavigate}>
                    <div className="flex flex-row justify-center items-center gap-3">
                        <p className="text-sm">{t("onboarding:exploreProjects.cta")}</p>
                        <ChevronRightIcon className="size-4" strokeWidth={2} />
                    </div>
                </Button>

                <SimpleTextButton onClick={advanceStep}>
                    {t("onboarding:exploreProjects.skip")}
                </SimpleTextButton>
            </div>
            }
        />
    )
}
