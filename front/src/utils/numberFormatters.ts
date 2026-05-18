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

/**
 * Formats a byte count as a short human-readable string: 856 → "856 B", 12000 → "11.7 KB", 5000000 → "4.8 MB".
 */
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
