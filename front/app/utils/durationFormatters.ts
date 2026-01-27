/**
 * Formats a duration in seconds into a human-readable string (e.g., "2j 5h 10m 30s")
 * Minimalist version using unit reduction.
 */
export function formatDurationToFrenchHumanReadable(seconds: number): string {
    const units = [
        { label: 'a', seconds: 31536000 },
        { label: 'm', seconds: 2592000 },
        { label: 'j', seconds: 86400 },
        { label: 'h', seconds: 3600 },
        { label: 'm', seconds: 60 },
        { label: 's', seconds: 1 }
    ];

    const parts: string[] = [];
    let remainingSeconds = Math.abs(seconds);

    for (const { label, seconds: unitSec } of units) {
        if (remainingSeconds >= unitSec) {
            const count = Math.floor(remainingSeconds / unitSec);
            parts.push(`${count}${label}`);
            remainingSeconds %= unitSec; // Keep the remainder for the next unit
        }
    }

    // Join with spaces, or return "0s" if input was 0
    return parts.length > 0 ? parts.join(' ') : '0s';
}