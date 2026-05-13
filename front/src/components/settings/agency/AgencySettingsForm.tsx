import { useState } from "react";
import { useTranslation } from "react-i18next";
import { autoUpdate, flip, FloatingPortal, offset, shift, useDismiss, useFloating, useInteractions } from "@floating-ui/react";
import { BlockPicker } from "react-color";
import { EnvelopeIcon, GlobeAltIcon, PencilIcon } from "@heroicons/react/24/outline";
import { Input } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";
import AgencyLogo from "~/components/agency/AgencyLogo";
import { Agency } from "~/models/Agency";
import { useAgencySettingsForm } from "~/hooks/useAgencySettingsForm";
import { HEX_COLOR_PATTERN } from "~/utils/agencyValidation";

interface AgencySettingsFormProps {
    agency: Agency;
}

export default function AgencySettingsForm({ agency }: AgencySettingsFormProps) {
    const { t } = useTranslation();
    const {
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
    } = useAgencySettingsForm(agency);
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const trimmedBrandColor = brandColor.trim();
    const hasValidBrandColor = HEX_COLOR_PATTERN.test(trimmedBrandColor);

    const { refs, floatingStyles, context } = useFloating({
        open: isPickerOpen,
        onOpenChange: setIsPickerOpen,
        placement: "bottom",
        middleware: [offset(8), flip(), shift({ padding: 8 })],
        whileElementsMounted: autoUpdate,
    });

    const dismiss = useDismiss(context);
    const { getReferenceProps, getFloatingProps } = useInteractions([dismiss]);

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                void submit();
            }}
        >
            <div className="w-full mx-auto bg-clear overflow-hidden shadow-sm">
                <button
                    ref={refs.setReference}
                    type="button"
                    aria-label={t("agencySettings:brandColorPicker")}
                    onClick={() => setIsPickerOpen((open) => !open)}
                    {...getReferenceProps()}
                    className={`group relative h-30 w-full cursor-pointer ${hasValidBrandColor ? "" : "bg-light-gray"}`}
                    style={hasValidBrandColor ? { backgroundColor: trimmedBrandColor } : undefined}
                >
                    <div className={`absolute inset-0 flex items-center justify-center bg-dark/20 transition-opacity ${isPickerOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                        <PencilIcon className="size-5 text-clear" strokeWidth={1.8} />
                    </div>
                </button>

                {isPickerOpen && (
                    <FloatingPortal>
                        <div
                            ref={refs.setFloating}
                            style={floatingStyles}
                            className="z-70"
                            {...getFloatingProps()}
                        >
                            <BlockPicker
                                color={hasValidBrandColor ? trimmedBrandColor : "#ffffff"}
                                onChangeComplete={(color) => setBrandColor(color.hex)}
                            />
                        </div>
                    </FloatingPortal>
                )}

                <div className="px-6 -mt-12">
                    <div className="inline-block rounded-md bg-clear p-1">
                        <AgencyLogo agency={agency} editable className="w-24 h-24" />
                    </div>
                </div>

                <div className="px-7 pt-4 pb-6 flex flex-col gap-4">
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        simple
                        required
                        textStyle="text-heading-md"
                        placeholder={t("agencySettings:fields.namePlaceholder")}
                    />

                    <Input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        simple
                        textStyle="text-body-sm"
                        icon={<EnvelopeIcon className="size-4 text-dark" strokeWidth={1.8} />}
                        placeholder={t("agencySettings:fields.contactEmailPlaceholder")}
                    />

                    <Input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        simple
                        textStyle="text-body-sm"
                        icon={<GlobeAltIcon className="size-4 text-dark" strokeWidth={1.8} />}
                        placeholder={t("agencySettings:fields.websitePlaceholder")}
                    />

                    {validationErrorKey && (
                        <p className="text-body-sm text-danger">{t(validationErrorKey)}</p>
                    )}

                    {hasChanges && (
                        <div className="flex justify-end pt-2">
                            <Button type="submit" style="primary" isLoading={isPending} disabled={isPending}>
                                <p className="text-sm">{t("actions.save")}</p>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </form>
    );
}
