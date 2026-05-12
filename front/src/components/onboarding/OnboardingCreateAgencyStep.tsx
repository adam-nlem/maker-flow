import { useEffect, useState } from "react"
import { ChevronRightIcon } from "@heroicons/react/24/outline"
import { useTranslation } from "react-i18next"

import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import OnboardingStepLayout from "~/components/onboarding/OnboardingStepLayout"
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser"
import { useCreateAgency } from "~/hooks/api/agency/useCreateAgency"
import { useAdvanceOnboardingStep } from "~/hooks/api/onboarding/useAdvanceOnboardingStep"
import { resolveErrorMessage } from "~/services/apiErrorHandler/errorCodeMessages"
import { HEX_COLOR_PATTERN, validateAgencyForm } from "~/utils/agencyValidation"

export default function OnboardingCreateAgencyStep() {
    const { t } = useTranslation()
    const { user } = useCurrentUser()
    const { createAgency, isPending, error } = useCreateAgency()
    const { advanceStep } = useAdvanceOnboardingStep()

    const [name, setName] = useState("")
    const [brandColor, setBrandColor] = useState("")
    const [contactEmail, setContactEmail] = useState("")
    const [website, setWebsite] = useState("")
    const [validationErrorKey, setValidationErrorKey] = useState<string | null>(null)

    useEffect(() => {
        if (!user) return
        if (user.agency !== null || user.isClient) {
            void advanceStep()
        }
    }, [user, advanceStep])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const errorKey = validateAgencyForm({ name, brandColor, contactEmail, website })
        if (errorKey) {
            setValidationErrorKey(errorKey)
            return
        }
        setValidationErrorKey(null)

        try {
            await createAgency({
                name: name.trim(),
                brandColor: brandColor || null,
                contactEmail: contactEmail || null,
                website: website || null,
            })
            await advanceStep()
        } catch {
            // surfaced via mutation error / global toast
        }
    }

    const errorMessage = (validationErrorKey ? t(validationErrorKey) : null) || (error ? resolveErrorMessage(error) : null)
    const isValidBrandColor = HEX_COLOR_PATTERN.test(brandColor)

    return (
        <OnboardingStepLayout maxWidth="max-w-md">
            <form className="space-y-4 w-full" onSubmit={handleSubmit}>
                <Input
                    label={t("onboarding:createAgency.name.label")}
                    placeholder={t("onboarding:createAgency.name.placeholder")}
                    id="agency-name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <div className="flex flex-row items-end gap-3">
                    <Input
                        label={t("onboarding:createAgency.brandColor.label")}
                        placeholder={t("onboarding:createAgency.brandColor.placeholder")}
                        id="agency-brand-color"
                        name="brandColor"
                        type="text"
                        maxLength={7}
                        value={brandColor}
                        onChange={(e) => setBrandColor(e.target.value)}
                    />
                    <div
                        className={`h-9 w-9 rounded-lg border border-light-gray shrink-0 ${isValidBrandColor ? "" : "bg-primary"}`}
                        style={isValidBrandColor ? { backgroundColor: brandColor } : undefined}
                        aria-hidden="true"
                    />
                </div>

                <Input
                    label={t("onboarding:createAgency.contactEmail.label")}
                    placeholder={t("onboarding:createAgency.contactEmail.placeholder")}
                    id="agency-contact-email"
                    name="contactEmail"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                />

                <Input
                    label={t("onboarding:createAgency.website.label")}
                    placeholder={t("onboarding:createAgency.website.placeholder")}
                    id="agency-website"
                    name="website"
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                />

                <Button
                    type="submit"
                    style="primary"
                    className="mt-5"
                    isLoading={isPending}
                    disabled={isPending}
                >
                    <div className="flex flex-row justify-center items-center gap-3">
                        <p className="text-sm">{t("onboarding:createAgency.submit")}</p>
                        <ChevronRightIcon className="size-4" strokeWidth={2} />
                    </div>
                </Button>

                {errorMessage && (
                    <p className="text-body-xs text-danger text-center">{errorMessage}</p>
                )}
            </form>
        </OnboardingStepLayout>
    )
}
