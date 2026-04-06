import { PlusIcon } from "@heroicons/react/24/outline";
import type { Script } from "~/models/Script";
import ScriptCard from "./ScriptCard";
import { useCreateScript } from "~/hooks/api/scripts/useCreateScript";
import { useFocusScriptStore } from "~/stores/scripts/focusScriptStore";
import { SidePanel } from "~/components/ui/SidePanel";
import { useShowCurrentSubscription } from "~/hooks/api/subscriptions/useShowCurrentSubscription";
import { useListPlans } from "~/hooks/api/subscriptions/useListPlans";
import { useInfiniteScroll } from "~/hooks/useInfiniteScroll";
import { HttpException } from "~/services/httpClient/HttpException";

interface ScriptListPanelProps {
    scripts: Script[];
    projectUuid: string;
    hasMore: boolean;
    isLoadingMore: boolean;
    listMore: () => void;
}

export default function ScriptListPanel({ scripts, projectUuid, hasMore, isLoadingMore, listMore }: ScriptListPanelProps) {
    const { createScript, isPending } = useCreateScript();
    const focusedScriptUuid = useFocusScriptStore((state) => state.focusedScriptUuid);
    const setFocusedScriptUuid = useFocusScriptStore((state) => state.setFocusedScriptUuid);
    const sentinelRef = useInfiniteScroll(hasMore, isLoadingMore, listMore);
    const { subscription } = useShowCurrentSubscription();
    const { plans } = useListPlans();
    const currentPlanConfig = plans.find((p) => p.plan === subscription?.plan);
    const maxScripts = subscription ? (currentPlanConfig?.maxScriptsPerProject ?? null) : 1;
    const isLimitReached = maxScripts !== null && scripts.length >= maxScripts;

    const handleNewScript = async () => {
        try {
            const newScript = await createScript({ projectUuid, title: "Nouveau script" });
            setFocusedScriptUuid(newScript.uuid);
        } catch (error) {
            if (error instanceof HttpException && error.response.httpStatus === 402) {
                return;
            }
            throw error;
        }
    };

    const createButton = (
        <button
            onClick={handleNewScript}
            disabled={isPending || isLimitReached}
            className="text-gray hover:text-dark transition-colors disabled:opacity-50 cursor-pointer"
            title={isLimitReached ? "Limite atteinte pour votre abonnement" : "Nouveau script"}
        >
            <PlusIcon className="size-4" strokeWidth={2} />
        </button>
    );

    const listContent = (
        <div className="p-3 flex flex-col gap-1">
            {scripts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray">
                    <p className="text-body-sm text-center">Aucun script.</p>
                    <p className="text-body-xs text-center mt-1">Cliquez sur + pour en créer un.</p>
                </div>
            ) : (
                <>
                    {scripts.map((script) => (
                        <ScriptCard
                            key={script.uuid}
                            script={script}
                            isSelected={script.uuid === focusedScriptUuid}
                            onClick={() => setFocusedScriptUuid(script.uuid)}
                        />
                    ))}
                    <div ref={sentinelRef} className="h-1" />
                </>
            )}
        </div>
    );

    return (
        <>
            {/* Desktop */}
            <div className="hidden md:block">
                <SidePanel title="Scripts" side="left" headerActions={createButton}>
                    {listContent}
                </SidePanel>
            </div>

            {/* Mobile */}
            <div className="md:hidden flex flex-col h-full">
                <div className="flex flex-row items-center justify-between px-4 py-4 border-b border-light-gray">
                    <h2 className="text-heading-md">Scripts</h2>
                    {createButton}
                </div>
                <div className="flex-1 overflow-y-auto scrollbar-none">
                    {listContent}
                </div>
            </div>
        </>
    );
}
