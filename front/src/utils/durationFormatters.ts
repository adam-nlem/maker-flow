/**
 * Formats a duration in seconds into a French short-form label.
 * Uses the largest applicable units, limited to maxUnits.
 * Examples: "2h", "1j 5h", "1h 30min 5s"
 */
export function formatDurationToFrench(totalSeconds: number, maxUnits: number = Infinity): string {
    const units = [
        { label: 'a', seconds: 31536000 },
        { label: 'mo', seconds: 2592000 },
        { label: 'j', seconds: 86400 },
        { label: 'h', seconds: 3600 },
        { label: 'min', seconds: 60 },
        { label: 's', seconds: 1 },
    ];

    const parts: string[] = [];
    let remainingSeconds = Math.abs(totalSeconds);

    for (const { label, seconds: unitSec } of units) {
        if (parts.length >= maxUnits) break;

        if (remainingSeconds >= unitSec) {
            const count = Math.floor(remainingSeconds / unitSec);
            parts.push(`${count}${label}`);
            remainingSeconds %= unitSec;
        }
    }

    return parts.length > 0 ? parts.join(' ') : '0s';
}

/**
 * Formats a duration in seconds into a clock-style `m:ss` label (e.g. for a video player footer).
 * Examples: 5 → "0:05", 42 → "0:42", 135 → "2:15".
 */
export function formatDurationToClock(totalSeconds: number): string {
    const safeSeconds = Math.max(0, Math.floor(totalSeconds));
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
