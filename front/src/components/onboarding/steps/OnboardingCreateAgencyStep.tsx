import { useEffect, useState } from "react"
import { ArrowRightIcon, BuildingOffice2Icon, PhotoIcon } from "@heroicons/react/24/outline"
import { useTranslation } from "react-i18next"

import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import OnboardingStepLayout from "~/components/onboarding/OnboardingStepLayout"
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser"
import { useCreateAgency } from "~/hooks/api/agency/useCreateAgency"
import { useAdvanceOnboardingStep } from "~/hooks/api/onboarding/useAdvanceOnboardingStep"
import { resolveErrorMessage } from "~/services/apiErrorHandler/errorCodeMessages"
import FileUpload from "../../ui/FileUpload"
import { useOnboardingCreateAgencyStore } from "~/stores/onboarding/onboardingCreateAgencyStore"

export default function OnboardingCreateAgencyStep() {
  const { t } = useTranslation()
  const { user } = useCurrentUser()
  const { createAgency, isPending, error, validationErrorKey } = useCreateAgency()
  const { advanceStep } = useAdvanceOnboardingStep()

  const agencyName = useOnboardingCreateAgencyStore((state) => state.agencyName);
  const setAgencyName = useOnboardingCreateAgencyStore((state) => state.setAgencyName);
  const setAgencyLogoPreviewUrl = useOnboardingCreateAgencyStore((state) => state.setAgencyLogoPreviewUrl);
  const setAgency = useOnboardingCreateAgencyStore((state) => state.setAgency);

  const [logo, setLogo] = useState<File | null>(null)

  const handleLogoSelected = (file: File, previewUrl: string | null) => {
    setLogo(file)
    setAgencyLogoPreviewUrl(previewUrl)
  }

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const agency = await createAgency({ name: agencyName, logo })
      if (!agency) return
      setAgency(agency)
      await advanceStep()
    } catch {
      // surfaced via mutation error / global toast
    }
  }

  const errorMessage = (validationErrorKey ? t(validationErrorKey) : null) || (error ? resolveErrorMessage(error) : null)

  return (
    <OnboardingStepLayout>
      <form className="space-y-3 w-full" onSubmit={handleSubmit}>
        <Input
          label={t("onboarding:createAgency.name.label")}
          placeholder={t("onboarding:createAgency.name.placeholder")}
          id="agency-name"
          name="name"
          type="text"
          required
          value={agencyName}
          className="size-12"
          icon={<BuildingOffice2Icon className="size-4 text-muted-2" />}
          onChange={(e) => setAgencyName(e.target.value)}
        />


        <p className="text-heading-sm text-dark">{t("onboarding:createAgency.logo.label")}</p>
        <FileUpload
          accept="image/png"
          icon={PhotoIcon}
          hint={t("onboarding:createAgency.logo.hint")}
          errorMessage={validationErrorKey ? t(validationErrorKey) : null}
          isPending={isPending}
          onFileSelected={handleLogoSelected}
          className="h-50"
        />
        <Button
          type="submit"
          style="primary"
          className="mt-5"
          width="w-fit"
          height="h-11"
          isLoading={isPending}
          disabled={isPending}
        >
          <p className="text-sm">{t("onboarding:createAgency.submit")}</p>
          <ArrowRightIcon className="size-4" />
        </Button>

        {errorMessage && (
          <p className="text-body-xs text-danger text-center">{errorMessage}</p>
        )}
      </form>
    </OnboardingStepLayout>
  )
}
