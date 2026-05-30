import { useTranslation } from "react-i18next"

import OnboardingStepLayout from "~/components/onboarding/OnboardingStepLayout"
import InviteClientForm from "~/components/agency/settings/project/InviteClientForm"
import SimpleTextButton from "~/components/ui/SimpleTextButton"
import { useFocusProjectStore } from "~/stores/project/focusProjectStore"
import { useAdvanceOnboardingStep } from "~/hooks/api/onboarding/useAdvanceOnboardingStep"

export default function OnboardingInviteFirstClientStep() {
    const { t } = useTranslation()
    const projectUuid = useFocusProjectStore((s) => s.focusedProjectUuid)
    const { advanceStep } = useAdvanceOnboardingStep()

    if (!projectUuid) return null

    return (
        <OnboardingStepLayout
            maxWidth="max-w-md"
            left={
            <div className="flex flex-col items-center gap-5 w-full">
                <InviteClientForm projectUuid={projectUuid} onInvited={advanceStep} />

                <SimpleTextButton onClick={advanceStep}>
                    {t("onboarding:subscriptionStep.skip")}
                </SimpleTextButton>
            </div>
            }
        />
    )
}
