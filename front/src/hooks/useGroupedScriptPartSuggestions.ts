import { useMemo } from "react";

import type { ScriptPartSuggestion } from "~/models/ScriptPartSuggestion";
import { ScriptPartSuggestionAction } from "~/models/enums/ScriptPartSuggestionAction";

/**
 * Groups pending script-part suggestions into two maps for fast lookup while rendering
 * the parts list: one keyed by the target part UUID (rewrite/delete/reorder actions)
 * and one keyed by the proposed insertion position (insert action).
 */
export function useGroupedScriptPartSuggestions(suggestions: ScriptPartSuggestion[]) {
    const suggestionsByPart = useMemo(() => {
        const map = new Map<string, ScriptPartSuggestion[]>();
        for (const s of suggestions) {
            if (s.scriptPartUuid && s.action !== ScriptPartSuggestionAction.Insert) {
                const list = map.get(s.scriptPartUuid) ?? [];
                list.push(s);
                map.set(s.scriptPartUuid, list);
            }
        }
        return map;
    }, [suggestions]);

    const insertSuggestionsByPosition = useMemo(() => {
        const map = new Map<number, ScriptPartSuggestion[]>();
        for (const s of suggestions) {
            if (s.action === ScriptPartSuggestionAction.Insert && s.proposedPosition !== null) {
                const list = map.get(s.proposedPosition) ?? [];
                list.push(s);
                map.set(s.proposedPosition, list);
            }
        }
        return map;
    }, [suggestions]);

    return { suggestionsByPart, insertSuggestionsByPosition };
}
