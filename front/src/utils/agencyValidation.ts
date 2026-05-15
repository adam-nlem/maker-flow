export interface AgencyFormData {
    name: string
    contactEmail: string
    website: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const URL_PATTERN = /^https?:\/\/.+/i

/**
 * Validates an agency form (create or update) and returns the first failing i18n key, or null if valid.
 * Callers run the returned key through `t()` to render the localized message.
 */
export function validateAgencyForm({ name, contactEmail, website }: AgencyFormData): string | null {
    if (!name.trim()) return "agencySettings:validation.nameRequired"
    if (contactEmail && !EMAIL_PATTERN.test(contactEmail)) return "agencySettings:validation.contactEmailFormat"
    if (website && !URL_PATTERN.test(website)) return "agencySettings:validation.websiteFormat"
    return null
}
