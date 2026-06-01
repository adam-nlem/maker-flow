import { useTranslation } from "react-i18next"

import OnboardingStepLayout from "~/components/onboarding/OnboardingStepLayout"
import InviteClientForm from "~/components/agency/settings/project/InviteClientForm"
import SimpleTextButton from "~/components/ui/SimpleTextButton"
import { useFocusProjectStore } from "~/stores/project/focusProjectStore"
import { useAdvanceOnboardingStep } from "~/hooks/api/onboarding/useAdvanceOnboardingStep"
import { useOnboardingInviteFirstClientStore } from "~/stores/onboarding/onboardingInviteFirstClientStore"
import type { Invitation } from "~/models/Invitation"

export default function OnboardingInviteFirstClientStep() {
  const { t } = useTranslation()
  const projectUuid = useFocusProjectStore((s) => s.focusedProjectUuid)
  const { advanceStep } = useAdvanceOnboardingStep()

  const setFirstName = useOnboardingInviteFirstClientStore((s) => s.setFirstName)
  const setLastName = useOnboardingInviteFirstClientStore((s) => s.setLastName)
  const setEmail = useOnboardingInviteFirstClientStore((s) => s.setEmail)
  const setInvitation = useOnboardingInviteFirstClientStore((s) => s.setInvitation)

  if (!projectUuid) return null

  const handleValuesChange = (values: { firstName: string; lastName: string; email: string }) => {
    setFirstName(values.firstName)
    setLastName(values.lastName)
    setEmail(values.email)
  }

  const handleInvited = (invitation: Invitation) => {
    setInvitation(invitation)
    void advanceStep()
  }

  return (
    <OnboardingStepLayout
      children={
        <div className="flex flex-col items-start gap-5 w-full">
          <InviteClientForm
            projectUuid={projectUuid}
            onInvited={handleInvited}
            onValuesChange={handleValuesChange}
          />

          <SimpleTextButton onClick={advanceStep}>
            {t("onboarding:subscriptionStep.skip")}
          </SimpleTextButton>
        </div>
      }
    />
  )
}
