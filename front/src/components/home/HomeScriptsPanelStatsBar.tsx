import {
    ScriptStatusGroup,
    scriptStatusGroupOptions,
    scriptStatusGroupToBgFullClass,
    scriptStatusGroupToFrenchTranslation,
    scriptStatusGroupToTextClass,
} from "~/models/enums/ScriptStatusGroup";

interface HomeScriptsPanelStatsBarProps {
    counts: Record<ScriptStatusGroup, number>;
}

export default function HomeScriptsPanelStatsBar({ counts }: HomeScriptsPanelStatsBarProps) {
    const total = counts[ScriptStatusGroup.Idea] + counts[ScriptStatusGroup.InProgress] + counts[ScriptStatusGroup.Done];

    return (
        <div className="flex flex-col gap-2 px-4 py-3 border-b border-light-gray">
            <div className="flex flex-row items-center justify-between gap-2">
                {scriptStatusGroupOptions.map((group) => (
                    <span key={group} className={`text-heading-xs ${scriptStatusGroupToTextClass[group]}`}>
                        {counts[group]} {scriptStatusGroupToFrenchTranslation[group].toLowerCase()}
                    </span>
                ))}
            </div>
            <div className="flex flex-row h-1 rounded-full overflow-hidden bg-light-gray gap-0.5">
                {total > 0 && scriptStatusGroupOptions.map((group) => (
                    counts[group] > 0 ? (
                        <div
                            key={group}
                            className={scriptStatusGroupToBgFullClass[group]}
                            style={{ flexGrow: counts[group] }}
                        />
                    ) : null
                ))}
            </div>
        </div>
    );
}
