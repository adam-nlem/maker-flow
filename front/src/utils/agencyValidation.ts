export interface CreateAgencyFormData {
    name: string
    brandColor: string
    contactEmail: string
    website: string
}

export const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const URL_PATTERN = /^https?:\/\/.+/i

/**
 * Validates a create-agency form and returns the first failing i18n key, or null if valid.
 * Callers run the returned key through `t()` to render the localized message.
 */
export function validateCreateAgencyForm({ name, brandColor, contactEmail, website }: CreateAgencyFormData): string | null {
    if (!name.trim()) return "onboarding:createAgency.validation.nameRequired"
    if (brandColor && !HEX_COLOR_PATTERN.test(brandColor)) return "onboarding:createAgency.validation.brandColorFormat"
    if (contactEmail && !EMAIL_PATTERN.test(contactEmail)) return "onboarding:createAgency.validation.contactEmailFormat"
    if (website && !URL_PATTERN.test(website)) return "onboarding:createAgency.validation.websiteFormat"
    return null
}
