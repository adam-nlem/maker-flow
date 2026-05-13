import { useEffect, useState } from "react";
import { Agency } from "~/models/Agency";
import { useUpdateAgency } from "~/hooks/api/agency/useUpdateAgency";
import { validateAgencyForm } from "~/utils/agencyValidation";

export function useAgencySettingsForm(agency: Agency) {
    const [name, setNameValue] = useState(agency.name ?? "");
    const [brandColor, setBrandColorValue] = useState(agency.brandColor ?? "");
    const [contactEmail, setContactEmailValue] = useState(agency.contactEmail ?? "");
    const [website, setWebsiteValue] = useState(agency.website ?? "");
    const [validationErrorKey, setValidationErrorKey] = useState<string | null>(null);

    const { updateAgency, isPending } = useUpdateAgency();

    useEffect(() => {
        setNameValue(agency.name ?? "");
        setBrandColorValue(agency.brandColor ?? "");
        setContactEmailValue(agency.contactEmail ?? "");
        setWebsiteValue(agency.website ?? "");
    }, [agency]);

    const trimmedBrandColor = brandColor.trim();
    const hasChanges =
        name !== (agency.name ?? "") ||
        trimmedBrandColor !== (agency.brandColor ?? "") ||
        contactEmail !== (agency.contactEmail ?? "") ||
        website !== (agency.website ?? "");

    const setName = (value: string) => {
        setNameValue(value);
        setValidationErrorKey(null);
    };

    const setBrandColor = (value: string) => {
        setBrandColorValue(value);
        setValidationErrorKey(null);
    };

    const setContactEmail = (value: string) => {
        setContactEmailValue(value);
        setValidationErrorKey(null);
    };

    const setWebsite = (value: string) => {
        setWebsiteValue(value);
        setValidationErrorKey(null);
    };

    const submit = async () => {
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

    return {
        name,
        setName,
        brandColor,
        setBrandColor,
        contactEmail,
        setContactEmail,
        website,
        setWebsite,
        validationErrorKey,
        hasChanges,
        isPending,
        submit,
    };
}
