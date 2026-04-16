import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DocumentTextIcon, PlusIcon } from "@heroicons/react/24/outline";
import type { Script } from "~/models/Script";
import Pill from "~/components/ui/Pill";
import Shimmer from "~/components/ui/Shimmer";
import { useListPaginatedScripts } from "~/hooks/api/scripts/useListPaginatedScripts";
import { useCreateScript } from "~/hooks/api/scripts/useCreateScript";
import { useFocusScriptStore } from "~/stores/scripts/focusScriptStore";
import { useShowCurrentSubscription } from "~/hooks/api/subscriptions/useShowCurrentSubscription";
import { useListPlans } from "~/hooks/api/subscriptions/useListPlans";
import { ScriptStatusGroup } from "~/models/enums/ScriptStatusGroup";
import { scriptsPath } from "~/routes/routePaths";
import { groupScriptsByStatusGroup, computeScriptGroupCounts } from "~/utils/scriptHelpers";
import { isScriptLimitReached } from "~/utils/subscriptionHelpers";
import HomeScriptsPanelStatsBar from "./HomeScriptsPanelStatsBar";
import HomeScriptsPanelSection from "./HomeScriptsPanelSection";

interface HomeScriptsPanelProps {
    projectUuid: string;
}

export default function HomeScriptsPanel({ projectUuid }: HomeScriptsPanelProps) {
    const navigate = useNavigate();
    const { scripts, isLoading } = useListPaginatedScripts({ projectUuid, limit: 100 });
    const { createScript, isPending } = useCreateScript();
    const setFocusedScriptUuid = useFocusScriptStore((state) => state.setFocusedScriptUuid);
    const { subscription } = useShowCurrentSubscription();
    const { plans } = useListPlans();
    const isLimitReached = isScriptLimitReached(scripts.length, subscription, plans);
    const grouped = useMemo(() => groupScriptsByStatusGroup(scripts), [scripts]);
    const counts = computeScriptGroupCounts(grouped);

    const handleNewScript = async () => {
        const newScript = await createScript({ projectUuid, title: "Nouveau script" });
        setFocusedScriptUuid(newScript.uuid);
        navigate(scriptsPath);
    };

    const handleTileClick = (script: Script) => {
        setFocusedScriptUuid(script.uuid);
        navigate(scriptsPath);
    };

    return (
        <div className="w-full md:w-1/2 shrink-0 flex flex-col border border-light-gray rounded-lg bg-clear overflow-hidden">
            <div className="flex flex-row items-center justify-between px-4 py-3 border-b border-light-gray">
                <div className="flex flex-row items-center gap-2">
                    <DocumentTextIcon className="size-5 text-gray" strokeWidth={2} />
                    <h2 className="text-heading-md">Scripts</h2>
                </div>
                {!isLimitReached && (
                    <Pill
                        icon={PlusIcon}
                        label="Nouveau"
                        isSelected
                        onClick={isPending ? undefined : handleNewScript}
                        bgColorClassName="bg-primary/10"
                        borderColorClassName="border-primary/30"
                        textColorClassName="text-primary"
                    />
                )}
            </div>

            {isLoading ? (
                <div className="flex flex-col gap-3 p-4">
                    <Shimmer width="w-full" height="h-4" />
                    <Shimmer width="w-full" height="h-1" radius="rounded-full" />
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex flex-row items-center gap-2">
                            <Shimmer width="w-8" height="h-8" radius="rounded-md" />
                            <div className="flex flex-col gap-1 flex-1">
                                <Shimmer width="w-full" height="h-3" />
                                <Shimmer width="w-24" height="h-2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    <HomeScriptsPanelStatsBar counts={counts} />
                    {scripts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-gray">
                            <p className="text-body-sm text-center">Aucun script.</p>
                            <p className="text-body-xs text-center mt-1">Cliquez sur + Nouveau pour en créer un.</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto scrollbar-none flex flex-col">
                            <HomeScriptsPanelSection
                                group={ScriptStatusGroup.InProgress}
                                scripts={grouped[ScriptStatusGroup.InProgress]}
                                defaultOpen
                                onTileClick={handleTileClick}
                            />
                            <HomeScriptsPanelSection
                                group={ScriptStatusGroup.Idea}
                                scripts={grouped[ScriptStatusGroup.Idea]}
                                defaultOpen
                                onTileClick={handleTileClick}
                            />
                            <HomeScriptsPanelSection
                                group={ScriptStatusGroup.Done}
                                scripts={grouped[ScriptStatusGroup.Done]}
                                defaultOpen={false}
                                onTileClick={handleTileClick}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
