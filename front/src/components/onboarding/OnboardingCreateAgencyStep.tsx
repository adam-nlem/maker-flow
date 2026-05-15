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
import { validateAgencyForm } from "~/utils/agencyValidation"

export default function OnboardingCreateAgencyStep() {
    const { t } = useTranslation()
    const { user } = useCurrentUser()
    const { createAgency, isPending, error } = useCreateAgency()
    const { advanceStep } = useAdvanceOnboardingStep()

    const [name, setName] = useState("")
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
        const errorKey = validateAgencyForm({ name, contactEmail, website })
        if (errorKey) {
            setValidationErrorKey(errorKey)
            return
        }
        setValidationErrorKey(null)

        try {
            await createAgency({
                name: name.trim(),
                contactEmail: contactEmail || null,
                website: website || null,
            })
            await advanceStep()
        } catch {
            // surfaced via mutation error / global toast
        }
    }

    const errorMessage = (validationErrorKey ? t(validationErrorKey) : null) || (error ? resolveErrorMessage(error) : null)

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
