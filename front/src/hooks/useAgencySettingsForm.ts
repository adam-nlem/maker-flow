import { useEffect, useState } from "react";
import { Agency } from "~/models/Agency";
import { useUpdateAgency } from "~/hooks/api/agency/useUpdateAgency";
import { validateAgencyForm } from "~/utils/agencyValidation";

export function useAgencySettingsForm(agency: Agency) {
    const [name, setNameValue] = useState(agency.name ?? "");
    const [accentColor, setAccentColorValue] = useState(agency.accentColor ?? "");
    const [backgroundColor, setBackgroundColorValue] = useState(agency.backgroundColor ?? "");
    const [backgroundSecondaryColor, setBackgroundSecondaryColorValue] = useState(agency.backgroundSecondaryColor ?? "");
    const [textColor, setTextColorValue] = useState(agency.textColor ?? "");
    const [textSecondaryColor, setTextSecondaryColorValue] = useState(agency.textSecondaryColor ?? "");
    const [headingFont, setHeadingFontValue] = useState(agency.headingFont ?? "");
    const [bodyFont, setBodyFontValue] = useState(agency.bodyFont ?? "");
    const [contactEmail, setContactEmailValue] = useState(agency.contactEmail ?? "");
    const [website, setWebsiteValue] = useState(agency.website ?? "");
    const [validationErrorKey, setValidationErrorKey] = useState<string | null>(null);

    const { updateAgency, isPending } = useUpdateAgency();

    useEffect(() => {
        setNameValue(agency.name ?? "");
        setAccentColorValue(agency.accentColor ?? "");
        setBackgroundColorValue(agency.backgroundColor ?? "");
        setBackgroundSecondaryColorValue(agency.backgroundSecondaryColor ?? "");
        setTextColorValue(agency.textColor ?? "");
        setTextSecondaryColorValue(agency.textSecondaryColor ?? "");
        setHeadingFontValue(agency.headingFont ?? "");
        setBodyFontValue(agency.bodyFont ?? "");
        setContactEmailValue(agency.contactEmail ?? "");
        setWebsiteValue(agency.website ?? "");
    }, [agency]);

    const trimmedAccentColor = accentColor.trim();
    const trimmedBackgroundColor = backgroundColor.trim();
    const trimmedBackgroundSecondaryColor = backgroundSecondaryColor.trim();
    const trimmedTextColor = textColor.trim();
    const trimmedTextSecondaryColor = textSecondaryColor.trim();

    const hasChanges =
        name !== (agency.name ?? "") ||
        trimmedAccentColor !== (agency.accentColor ?? "") ||
        trimmedBackgroundColor !== (agency.backgroundColor ?? "") ||
        trimmedBackgroundSecondaryColor !== (agency.backgroundSecondaryColor ?? "") ||
        trimmedTextColor !== (agency.textColor ?? "") ||
        trimmedTextSecondaryColor !== (agency.textSecondaryColor ?? "") ||
        headingFont !== (agency.headingFont ?? "") ||
        bodyFont !== (agency.bodyFont ?? "") ||
        contactEmail !== (agency.contactEmail ?? "") ||
        website !== (agency.website ?? "");

    const wrapSetter = <T,>(setter: (value: T) => void) => (value: T) => {
        setter(value);
        setValidationErrorKey(null);
    };

    const submit = async () => {
        const errorKey = validateAgencyForm({
            name,
            accentColor: trimmedAccentColor,
            backgroundColor: trimmedBackgroundColor,
            backgroundSecondaryColor: trimmedBackgroundSecondaryColor,
            textColor: trimmedTextColor,
            textSecondaryColor: trimmedTextSecondaryColor,
            headingFont,
            bodyFont,
            contactEmail,
            website,
        });
        if (errorKey) {
            setValidationErrorKey(errorKey);
            return;
        }
        setValidationErrorKey(null);

        const data: Parameters<typeof updateAgency>[0] = { agencyUuid: agency.uuid, name };
        if (trimmedAccentColor) data.accentColor = trimmedAccentColor;
        if (trimmedBackgroundColor) data.backgroundColor = trimmedBackgroundColor;
        if (trimmedBackgroundSecondaryColor) data.backgroundSecondaryColor = trimmedBackgroundSecondaryColor;
        if (trimmedTextColor) data.textColor = trimmedTextColor;
        if (trimmedTextSecondaryColor) data.textSecondaryColor = trimmedTextSecondaryColor;
        if (headingFont) data.headingFont = headingFont;
        if (bodyFont) data.bodyFont = bodyFont;
        if (contactEmail) data.contactEmail = contactEmail;
        if (website) data.website = website;

        await updateAgency(data);
    };

    return {
        name,
        setName: wrapSetter(setNameValue),
        accentColor,
        setAccentColor: wrapSetter(setAccentColorValue),
        backgroundColor,
        setBackgroundColor: wrapSetter(setBackgroundColorValue),
        backgroundSecondaryColor,
        setBackgroundSecondaryColor: wrapSetter(setBackgroundSecondaryColorValue),
        textColor,
        setTextColor: wrapSetter(setTextColorValue),
        textSecondaryColor,
        setTextSecondaryColor: wrapSetter(setTextSecondaryColorValue),
        headingFont,
        setHeadingFont: wrapSetter(setHeadingFontValue),
        bodyFont,
        setBodyFont: wrapSetter(setBodyFontValue),
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
