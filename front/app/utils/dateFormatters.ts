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

export function formatToFrenchRelative(date: Date): string {
    const diffInMs = date.getTime() - Date.now();
    const diffInSec = Math.round(diffInMs / 1000);
    
    const units: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
        { unit: 'year',   seconds: 31536000 },
        { unit: 'month',  seconds: 2592000 },
        { unit: 'day',    seconds: 86400 },
        { unit: 'hour',   seconds: 3600 },
        { unit: 'minute', seconds: 60 },
        { unit: 'second', seconds: 1 }
    ];

    // Find the first unit where the difference is larger than the unit's value
    const match = units.find(u => Math.abs(diffInSec) >= u.seconds) || units[units.length - 1];
    
    // If older than a week, use your existing short date format
    if (Math.abs(diffInSec) >= 604800) {
        return `le ${formatToFrenchDateShort(date).replace(/ \d{4}$/, '')}`;
    }

    return new Intl.RelativeTimeFormat('fr-FR', { numeric: 'auto' })
        .format(Math.round(diffInSec / match.seconds), match.unit);
}