import { useTranslation } from "react-i18next";
import { EnvelopeIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import { Input } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";
import AgencyLogo from "~/components/agency/AgencyLogo";
import { Agency } from "~/models/Agency";
import { useAgencySettingsForm } from "~/hooks/useAgencySettingsForm";

interface AgencySettingsFormProps {
    agency: Agency;
}

export default function AgencySettingsForm({ agency }: AgencySettingsFormProps) {
    const { t } = useTranslation();
    const form = useAgencySettingsForm(agency);

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                void form.submit();
            }}
        >
            <div className="w-full mx-auto bg-clear overflow-hidden">
                <div className="px-6 pt-6">
                    <AgencyLogo agency={agency} editable className="w-24 h-24" />
                </div>

                <div className="px-7 pt-4 pb-6 flex flex-col gap-6">
                    <section className="flex flex-col gap-4">
                        <h3 className="text-body-xs text-muted-2 uppercase tracking-wide">{t("agencySettings:sections.identity")}</h3>

                        <Input
                            value={form.name}
                            onChange={(e) => form.setName(e.target.value)}
                            simple
                            required
                            textStyle="text-heading-md"
                            placeholder={t("agencySettings:fields.namePlaceholder")}
                        />

                        <Input
                            type="email"
                            value={form.contactEmail}
                            onChange={(e) => form.setContactEmail(e.target.value)}
                            simple
                            textStyle="text-body-sm"
                            icon={<EnvelopeIcon className="size-4 text-dark" strokeWidth={1.8} />}
                            placeholder={t("agencySettings:fields.contactEmailPlaceholder")}
                        />

                        <Input
                            type="url"
                            value={form.website}
                            onChange={(e) => form.setWebsite(e.target.value)}
                            simple
                            textStyle="text-body-sm"
                            icon={<GlobeAltIcon className="size-4 text-dark" strokeWidth={1.8} />}
                            placeholder={t("agencySettings:fields.websitePlaceholder")}
                        />
                    </section>

                    {form.validationErrorKey && (
                        <p className="text-body-sm text-danger">{t(form.validationErrorKey)}</p>
                    )}

                    {form.hasChanges && (
                        <div className="flex justify-end">
                            <Button type="submit" style="primary" isLoading={form.isPending} disabled={form.isPending}>
                                <p className="text-sm">{t("actions.save")}</p>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </form>
    );
}
