import type { Script } from "~/models/Script";
import { ScriptStatus } from "~/models/enums/ScriptStatus";
import { ScriptStatusGroup, scriptStatusGroupOptions, scriptStatusToGroup } from "~/models/enums/ScriptStatusGroup";

/**
 * Groups scripts by ScriptStatusGroup and sorts each group by updatedAt/createdAt DESC.
 */
export function groupScriptsByStatusGroup(scripts: Script[]): Record<ScriptStatusGroup, Script[]> {
    const map: Record<ScriptStatusGroup, Script[]> = {
        [ScriptStatusGroup.Idea]: [],
        [ScriptStatusGroup.InProgress]: [],
        [ScriptStatusGroup.Done]: [],
    };

    for (const script of scripts) {
        const group = scriptStatusToGroup[script.status ?? ScriptStatus.Idea];
        map[group].push(script);
    }

    for (const group of scriptStatusGroupOptions) {
        map[group].sort((a, b) => {
            const aDate = (a.updatedAt ?? a.createdAt).getTime();
            const bDate = (b.updatedAt ?? b.createdAt).getTime();
            return bDate - aDate;
        });
    }

    return map;
}

/**
 * Computes the count of scripts in each status group.
 */
export function computeScriptGroupCounts(grouped: Record<ScriptStatusGroup, Script[]>): Record<ScriptStatusGroup, number> {
    return {
        [ScriptStatusGroup.Idea]: grouped[ScriptStatusGroup.Idea].length,
        [ScriptStatusGroup.InProgress]: grouped[ScriptStatusGroup.InProgress].length,
        [ScriptStatusGroup.Done]: grouped[ScriptStatusGroup.Done].length,
    };
}
