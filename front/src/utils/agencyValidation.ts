import { isBrandFont } from "~/models/enums/BrandFont"

export interface AgencyFormData {
    name: string
    accentColor: string
    backgroundColor: string
    backgroundSecondaryColor: string
    textColor: string
    textSecondaryColor: string
    headingFont: string
    bodyFont: string
    contactEmail: string
    website: string
}

export const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const URL_PATTERN = /^https?:\/\/.+/i

/**
 * Validates an agency form (create or update) and returns the first failing i18n key, or null if valid.
 * Callers run the returned key through `t()` to render the localized message.
 */
export function validateAgencyForm({
    name,
    accentColor,
    backgroundColor,
    backgroundSecondaryColor,
    textColor,
    textSecondaryColor,
    headingFont,
    bodyFont,
    contactEmail,
    website,
}: AgencyFormData): string | null {
    if (!name.trim()) return "agencySettings:validation.nameRequired"
    if (accentColor && !HEX_COLOR_PATTERN.test(accentColor)) return "agencySettings:validation.accentColorFormat"
    if (backgroundColor && !HEX_COLOR_PATTERN.test(backgroundColor)) return "agencySettings:validation.backgroundColorFormat"
    if (backgroundSecondaryColor && !HEX_COLOR_PATTERN.test(backgroundSecondaryColor)) return "agencySettings:validation.backgroundSecondaryColorFormat"
    if (textColor && !HEX_COLOR_PATTERN.test(textColor)) return "agencySettings:validation.textColorFormat"
    if (textSecondaryColor && !HEX_COLOR_PATTERN.test(textSecondaryColor)) return "agencySettings:validation.textSecondaryColorFormat"
    if (headingFont && !isBrandFont(headingFont)) return "agencySettings:validation.headingFontInvalid"
    if (bodyFont && !isBrandFont(bodyFont)) return "agencySettings:validation.bodyFontInvalid"
    if (contactEmail && !EMAIL_PATTERN.test(contactEmail)) return "agencySettings:validation.contactEmailFormat"
    if (website && !URL_PATTERN.test(website)) return "agencySettings:validation.websiteFormat"
    return null
}
