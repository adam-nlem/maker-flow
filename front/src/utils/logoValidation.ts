const LOGO_MIME_TYPE = "image/png"
const LOGO_MAX_SIZE = 5 * 1024 * 1024

/**
 * Validates a logo file and returns the first failing i18n key, or null if valid.
 * Callers run the returned key through `t()` to render the localized message.
 */
export function validateLogo(file: File | null): string | null {
    if (!file) return "common:validation.logo.required"
    if (file.type !== LOGO_MIME_TYPE) return "common:validation.logo.mimeType"
    if (file.size > LOGO_MAX_SIZE) return "common:validation.logo.tooLarge"
    return null
}
