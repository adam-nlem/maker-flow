import { useEffect, useState } from "react";

import type { ScriptPart } from "~/models/ScriptPart";

/**
 * Mirrors the `parts` prop into local state so the parts list can show optimistic
 * reorder updates without waiting for the server. Skips syncing while `isPaused`
 * is true (e.g. during an in-flight drag) to avoid clobbering the in-progress move.
 */
export function useSyncedLocalParts(parts: ScriptPart[], isPaused: boolean) {
    const [localParts, setLocalParts] = useState<ScriptPart[]>(parts);

    useEffect(() => {
        if (!isPaused) setLocalParts(parts);
    }, [parts, isPaused]);

    return [localParts, setLocalParts] as const;
}
