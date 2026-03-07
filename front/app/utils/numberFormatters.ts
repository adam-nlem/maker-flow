/**
 * Formats a number in compact French locale: 1200 → "1,2 k", 42000 → "42 k", 1500000 → "1,5 M"
 * Values below 1000 are returned as-is: 856 → "856"
 */
export function formatCompactNumber(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(value);
}
