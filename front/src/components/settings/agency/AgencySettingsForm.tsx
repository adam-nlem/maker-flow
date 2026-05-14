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
import ColorField from "./ColorField";
import FontField from "./FontField";

interface AgencySettingsFormProps {
    agency: Agency;
}

const BACKGROUND_DEFAULT = "#141115";
const BACKGROUND_SECONDARY_DEFAULT = "#2d2d44";
const TEXT_DEFAULT = "#F0F0F0";
const TEXT_SECONDARY_DEFAULT = "#9ca3af";
const ACCENT_DEFAULT = "#43CEA9";
const HEADING_FONT_DEFAULT_LABEL = "Outfit";
const HEADING_FONT_DEFAULT_STACK = "Outfit, ui-sans-serif, system-ui, sans-serif";
const BODY_FONT_DEFAULT_LABEL = "Roboto";
const BODY_FONT_DEFAULT_STACK = "Roboto, ui-sans-serif, system-ui, sans-serif";

export default function AgencySettingsForm({ agency }: AgencySettingsFormProps) {
    const { t } = useTranslation();
    const form = useAgencySettingsForm(agency);
    const [isAccentPickerOpen, setIsAccentPickerOpen] = useState(false);

    const trimmedAccentColor = form.accentColor.trim();
    const hasValidAccentColor = HEX_COLOR_PATTERN.test(trimmedAccentColor);

    const { refs, floatingStyles, context } = useFloating({
        open: isAccentPickerOpen,
        onOpenChange: setIsAccentPickerOpen,
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
                void form.submit();
            }}
        >
            <div className="w-full mx-auto bg-clear overflow-hidden shadow-sm">
                <button
                    ref={refs.setReference}
                    type="button"
                    aria-label={t("agencySettings:colorPickerAriaLabel")}
                    onClick={() => setIsAccentPickerOpen((open) => !open)}
                    {...getReferenceProps()}
                    className={`group relative h-30 w-full cursor-pointer ${hasValidAccentColor ? "" : "bg-light-gray"}`}
                    style={hasValidAccentColor ? { backgroundColor: trimmedAccentColor } : undefined}
                >
                    <div className={`absolute inset-0 flex items-center justify-center bg-dark/20 transition-opacity ${isAccentPickerOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                        <PencilIcon className="size-5 text-clear" strokeWidth={1.8} />
                    </div>
                </button>

                {isAccentPickerOpen && (
                    <FloatingPortal>
                        <div
                            ref={refs.setFloating}
                            style={floatingStyles}
                            className="z-70"
                            {...getFloatingProps()}
                        >
                            <BlockPicker
                                color={hasValidAccentColor ? trimmedAccentColor : ACCENT_DEFAULT}
                                onChangeComplete={(color) => form.setAccentColor(color.hex)}
                            />
                        </div>
                    </FloatingPortal>
                )}

                <div className="px-6 -mt-12">
                    <div className="inline-block rounded-md bg-clear p-1">
                        <AgencyLogo agency={agency} editable className="w-24 h-24" />
                    </div>
                </div>

                <div className="px-7 pt-4 pb-6 flex flex-col gap-8">
                    <section className="flex flex-col gap-4">
                        <h3 className="text-body-xs text-gray uppercase tracking-wide">{t("agencySettings:sections.identity")}</h3>

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

                    <section className="flex flex-col gap-4">
                        <h3 className="text-body-xs text-gray uppercase tracking-wide">{t("agencySettings:sections.colors")}</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ColorField
                                label={t("agencySettings:fields.backgroundColor")}
                                value={form.backgroundColor}
                                defaultColor={BACKGROUND_DEFAULT}
                                onChange={form.setBackgroundColor}
                            />
                            <ColorField
                                label={t("agencySettings:fields.backgroundSecondaryColor")}
                                value={form.backgroundSecondaryColor}
                                defaultColor={BACKGROUND_SECONDARY_DEFAULT}
                                onChange={form.setBackgroundSecondaryColor}
                            />
                            <ColorField
                                label={t("agencySettings:fields.textColor")}
                                value={form.textColor}
                                defaultColor={TEXT_DEFAULT}
                                onChange={form.setTextColor}
                            />
                            <ColorField
                                label={t("agencySettings:fields.textSecondaryColor")}
                                value={form.textSecondaryColor}
                                defaultColor={TEXT_SECONDARY_DEFAULT}
                                onChange={form.setTextSecondaryColor}
                            />
                        </div>
                    </section>

                    <section className="flex flex-col gap-4">
                        <h3 className="text-body-xs text-gray uppercase tracking-wide">{t("agencySettings:sections.typography")}</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FontField
                                label={t("agencySettings:fields.headingFont")}
                                value={form.headingFont}
                                defaultLabel={HEADING_FONT_DEFAULT_LABEL}
                                defaultCssStack={HEADING_FONT_DEFAULT_STACK}
                                onChange={form.setHeadingFont}
                            />
                            <FontField
                                label={t("agencySettings:fields.bodyFont")}
                                value={form.bodyFont}
                                defaultLabel={BODY_FONT_DEFAULT_LABEL}
                                defaultCssStack={BODY_FONT_DEFAULT_STACK}
                                onChange={form.setBodyFont}
                            />
                        </div>
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
