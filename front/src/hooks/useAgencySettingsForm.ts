import { useEffect, useState } from "react";
import { Agency } from "~/models/Agency";
import { useUpdateAgency } from "~/hooks/api/agency/useUpdateAgency";
import { validateAgencyForm } from "~/utils/agencyValidation";

export function useAgencySettingsForm(agency: Agency) {
    const [name, setNameValue] = useState(agency.name ?? "");
    const [contactEmail, setContactEmailValue] = useState(agency.contactEmail ?? "");
    const [website, setWebsiteValue] = useState(agency.website ?? "");
    const [validationErrorKey, setValidationErrorKey] = useState<string | null>(null);

    const { updateAgency, isPending } = useUpdateAgency();

    useEffect(() => {
        setNameValue(agency.name ?? "");
        setContactEmailValue(agency.contactEmail ?? "");
        setWebsiteValue(agency.website ?? "");
    }, [agency]);

    const hasChanges =
        name !== (agency.name ?? "") ||
        contactEmail !== (agency.contactEmail ?? "") ||
        website !== (agency.website ?? "");

    const wrapSetter = <T,>(setter: (value: T) => void) => (value: T) => {
        setter(value);
        setValidationErrorKey(null);
    };

    const submit = async () => {
        const errorKey = validateAgencyForm({ name, contactEmail, website });
        if (errorKey) {
            setValidationErrorKey(errorKey);
            return;
        }
        setValidationErrorKey(null);

        const data: Parameters<typeof updateAgency>[0] = { agencyUuid: agency.uuid, name };
        if (contactEmail) data.contactEmail = contactEmail;
        if (website) data.website = website;

        await updateAgency(data);
    };

    return {
        name,
        setName: wrapSetter(setNameValue),
        contactEmail,
        setContactEmail: wrapSetter(setContactEmailValue),
        website,
        setWebsite: wrapSetter(setWebsiteValue),
        validationErrorKey,
        hasChanges,
        isPending,
        submit,
    };
}
