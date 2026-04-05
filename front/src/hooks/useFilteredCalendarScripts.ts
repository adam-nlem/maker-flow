import { useMemo } from "react";

import type { Script } from "~/models/Script";
import { platformOptions } from "~/models/enums/Platform";
import { scriptStatusOptions } from "~/models/enums/ScriptStatus";
import { useListCalendarScripts } from "~/hooks/api/scripts/useListCalendarScripts";
import { useListScriptTags } from "~/hooks/api/scriptTags/useListScriptTags";
import { useCalendarStore } from "~/stores/scripts/calendarStore";

interface UseFilteredCalendarScriptsProps {
    projectUuid: string;
}

/**
 * Fetches the calendar's scripts for the current month (from the store) and applies
 * the calendar's client-side filters (platforms, statuses, tags). Returns the result
 * as a Map keyed by date ("YYYY-MM-DD") for O(1) lookup by day cells.
 */
export function useFilteredCalendarScripts({ projectUuid }: UseFilteredCalendarScriptsProps) {
    const { currentMonth, currentYear, selectedPlatforms, selectedStatuses, selectedTagUuids } = useCalendarStore();

    const { scriptTags } = useListScriptTags({ projectUuid });
    const { scriptsByDay: fetchedScriptsByDay } = useListCalendarScripts({
        projectUuid,
        year: currentYear,
        month: currentMonth + 1,
    });

    const noPlatformFilter = selectedPlatforms.length === 0 || selectedPlatforms.length === platformOptions.length;
    const noStatusFilter = selectedStatuses.length === 0 || selectedStatuses.length === scriptStatusOptions.length;
    const noTagFilter = selectedTagUuids.length === 0 || (scriptTags.length > 0 && selectedTagUuids.length === scriptTags.length);

    const scriptsByDay = useMemo(() => {
        const map = new Map<string, Script[]>();

        if (noPlatformFilter && noStatusFilter && noTagFilter) {
            for (const group of fetchedScriptsByDay) {
                map.set(group.date, group.scripts);
            }
            return map;
        }

        for (const group of fetchedScriptsByDay) {
            const filtered = group.scripts.filter((script) => {
                if (!noPlatformFilter && !script.platforms.some((p) => selectedPlatforms.includes(p))) return false;
                if (!noStatusFilter && (!script.status || !selectedStatuses.includes(script.status))) return false;
                if (!noTagFilter && !script.tags.some((t) => selectedTagUuids.includes(t.uuid))) return false;
                return true;
            });
            if (filtered.length > 0) map.set(group.date, filtered);
        }
        return map;
    }, [fetchedScriptsByDay, selectedPlatforms, selectedStatuses, selectedTagUuids, noPlatformFilter, noStatusFilter, noTagFilter]);

    return { scriptsByDay };
}
