import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SettingsSection, settingsSectionTranslationKeys } from "~/models/enums/SettingsSection";
import { Input } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";
import Shimmer from "~/components/ui/Shimmer";
import { useCurrentAgency } from "~/hooks/api/agency/useCurrentAgency";
import { useUpdateAgency } from "~/hooks/api/agency/useUpdateAgency";
import { HEX_COLOR_PATTERN, validateAgencyForm } from "~/utils/agencyValidation";

export default function AgencySettings() {
    const { t } = useTranslation();
    const { agency, isLoading } = useCurrentAgency();

    const [name, setName] = useState("");
    const [brandColor, setBrandColor] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [website, setWebsite] = useState("");
    const [validationErrorKey, setValidationErrorKey] = useState<string | null>(null);

    const { updateAgency, isPending } = useUpdateAgency();

    useEffect(() => {
        if (agency) {
            setName(agency.name ?? "");
            setBrandColor(agency.brandColor ?? "");
            setContactEmail(agency.contactEmail ?? "");
            setWebsite(agency.website ?? "");
        }
    }, [agency]);

    if (isLoading || !agency) {
        return (
            <div className="h-full flex flex-col overflow-hidden">
                <div className="px-4 md:px-6 py-4 md:py-5 border-b border-light-gray">
                    <h2 className="text-heading-xl">{t(settingsSectionTranslationKeys[SettingsSection.Agency])}</h2>
                </div>
                <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-5 flex flex-col gap-4">
                    <Shimmer width="w-full" height="h-12" radius="rounded-lg" />
                    <Shimmer width="w-full" height="h-12" radius="rounded-lg" />
                    <Shimmer width="w-full" height="h-12" radius="rounded-lg" />
                </div>
            </div>
        );
    }

    const trimmedBrandColor = brandColor.trim();
    const hasChanges =
        name !== (agency.name ?? "") ||
        trimmedBrandColor !== (agency.brandColor ?? "") ||
        contactEmail !== (agency.contactEmail ?? "") ||
        website !== (agency.website ?? "");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const errorKey = validateAgencyForm({ name, brandColor: trimmedBrandColor, contactEmail, website });
        if (errorKey) {
            setValidationErrorKey(errorKey);
            return;
        }
        setValidationErrorKey(null);

        const data: Parameters<typeof updateAgency>[0] = { agencyUuid: agency.uuid, name };
        if (trimmedBrandColor) data.brandColor = trimmedBrandColor;
        if (contactEmail) data.contactEmail = contactEmail;
        if (website) data.website = website;

        await updateAgency(data);
    };

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="px-4 md:px-6 py-4 md:py-5 border-b border-light-gray flex flex-col gap-1">
                <h2 className="text-heading-xl">{t(settingsSectionTranslationKeys[SettingsSection.Agency])}</h2>
                <p className="text-body-sm text-gray">{t("agencySettings:subtitle")}</p>
            </div>

            <form className="flex-1 flex flex-col min-h-0" onSubmit={handleSubmit}>
                <div className="flex-1 overflow-y-auto scrollbar-none px-4 md:px-6 py-4 md:py-5">
                    <div className="flex flex-col gap-5">
                        <Input
                            label={t("agencySettings:fields.name")}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

                        <div>
                            <div className="flex flex-row items-end gap-3">
                                <div className="flex-1">
                                    <Input
                                        label={t("agencySettings:fields.brandColor")}
                                        placeholder="#43CEA9"
                                        value={brandColor}
                                        onChange={(e) => { setBrandColor(e.target.value); setValidationErrorKey(null); }}
                                    />
                                </div>
                                <div
                                    className="size-8 rounded-md border border-light-gray shrink-0"
                                    style={{ backgroundColor: HEX_COLOR_PATTERN.test(trimmedBrandColor) ? trimmedBrandColor : "transparent" }}
                                />
                            </div>
                            <p className="text-body-xs text-gray mt-1">{t("agencySettings:fields.brandColorHint")}</p>
                        </div>

                        <Input
                            label={t("agencySettings:fields.contactEmail")}
                            type="email"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                        />

                        <Input
                            label={t("agencySettings:fields.website")}
                            type="url"
                            placeholder="https://"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                        />

                        {validationErrorKey && (
                            <p className="text-body-sm text-danger">{t(validationErrorKey)}</p>
                        )}
                    </div>
                </div>

                {hasChanges && (
                    <div className="px-4 md:px-6 py-3 md:py-4 border-t border-light-gray">
                        <Button type="submit" style="primary" isLoading={isPending} disabled={isPending}>
                            <p className="text-sm">{t("actions.save")}</p>
                        </Button>
                    </div>
                )}
            </form>
        </div>
    );
}
