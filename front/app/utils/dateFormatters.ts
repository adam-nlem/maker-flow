/**
 * Formats a date to French locale with abbreviated month: "01 janv. 2024"
 */
export function formatToFrenchDateShort(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).format(date);
}

/**
 * Formats a date to French locale with full month name: "01 janvier 2024"
 */
export function formatToFrenchDateLong(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    }).format(date);
}

/**
 * Formats a date to numeric format: "01/01/2024"
 */
export function formatToNumericDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(date);
}
