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
import { navigationItemToIcon, navigationItemToIconSolid, navigationItemTranslationKeys, sidebarMainNavigationItems } from "~/models/enums/NavigationItem"
import { isNavigationItemSelected } from "~/utils/navigationHelpers"
import IconWithTextTile from "../ui/IconWithTextTile"
import IdentityPopoverView from "../sidebar/IdentityPopoverView"
import AgencyLogo from "~/components/agency/AgencyLogo"
import Shimmer from "~/components/ui/Shimmer"
import FileUpload from "../ui/FileUpload"

export default function OnboardingCreateAgencyStep() {
  const { t } = useTranslation()
  const { user } = useCurrentUser()
  const { createAgency, isPending, error, validationErrorKey } = useCreateAgency()
  const { advanceStep } = useAdvanceOnboardingStep()

  const [name, setName] = useState("")
  const [logo, setLogo] = useState<File | null>(null)
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

  const hasIdentity = name.trim().length > 0 || logo !== null

  useEffect(() => {
    if (!user) return
    if (user.agency !== null || user.isClient) {
      void advanceStep()
    }
  }, [user, advanceStep])

  const handleLogoSelected = (file: File, previewUrl: string | null) => {
    setLogo(file)
    setLogoPreviewUrl(previewUrl)
  }

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const agency = await createAgency({ name, logo })
      if (!agency) return
      await advanceStep()
    } catch {
      // surfaced via mutation error / global toast
    }
  }

  const errorMessage = (validationErrorKey ? t(validationErrorKey) : null) || (error ? resolveErrorMessage(error) : null)

  return (
    <OnboardingStepLayout
      left={
        <form className="space-y-3 w-full" onSubmit={handleSubmit}>
          <Input
            label={t("onboarding:createAgency.name.label")}
            placeholder={t("onboarding:createAgency.name.placeholder")}
            id="agency-name"
            name="name"
            type="text"
            required
            value={name}
            className="size-12"
            icon={<BuildingOffice2Icon className="size-4 text-muted-2" />}
            onChange={(e) => setName(e.target.value)}
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
      }
      right={
        <div className="bg-clear w-full h-full grid place-items-center">
          <div className="border border-pale-gray w-screen h-full rounded-xl flex items-end">
            <div className="h-full w-50 border-r border-pale-gray rounded-l-xl p-2 flex flex-col">
              <div className="flex flex-row items-center gap-3 rounded-lg cursor-pointer hover:bg-pale-gray p-3">
                <img src="favicon.png" className="size-9 rounded-md" />
                <p className="text-heading-sm">MakerFlow</p>
              </div>

              <div className="mt-4 flex flex-col p-3 gap-1">
                {sidebarMainNavigationItems.map((item) => {
                  const selected = isNavigationItemSelected(item, location.pathname);
                  return (
                    <IconWithTextTile
                      key={item}
                      icon={selected ? navigationItemToIconSolid[item] : navigationItemToIcon[item]}
                      label={t(navigationItemTranslationKeys[item])}
                      isSelected={selected}
                      className="w-full"
                    />
                  );
                })}
              </div>

              <div className="mt-auto">
                {hasIdentity ? (
                  <div className="m-3 flex flex-row items-center gap-3 rounded-lg p-1 border border-transparent min-w-0">
                    <AgencyLogo logoUrl={logoPreviewUrl} className="size-9 shrink-0" />
                    <span className="text-heading-sm font-semibold whitespace-nowrap truncate text-left">
                      {name}
                    </span>
                  </div>
                ) : (
                  <div className="m-3">
                    <Shimmer width="w-full" height="h-11" radius="rounded-lg" />
                  </div>
                )}
              </div>

            </div>

            <div className="p-4">
              <IdentityPopoverView name={name} logoUrl={logoPreviewUrl} user={user} />
            </div>
          </div>
        </div>
      }
    />
  )
}
