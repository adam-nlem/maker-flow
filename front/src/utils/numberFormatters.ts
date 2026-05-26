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
 * Formats a byte count as a short human-readable string.
 * Examples: 856 → "856 B", 12000 → "11.7 KB", 5000000 → "4.8 MB", 2147483648 → "2.0 GB".
 */
export function formatFileSize(bytes: number): string {
    const kb = 1024;
    const mb = kb * 1024;
    const gb = mb * 1024;

    if (bytes < kb) return `${bytes} B`;
    if (bytes < mb) return `${(bytes / kb).toFixed(1)} KB`;
    if (bytes < gb) return `${(bytes / mb).toFixed(1)} MB`;
    return `${(bytes / gb).toFixed(1)} GB`;
}
