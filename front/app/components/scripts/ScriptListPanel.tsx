import { useEffect, useRef } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import type { Script } from "~/models/Script";
import ScriptCard from "./ScriptCard";
import { useCreateScript } from "~/hooks/api/scripts/useCreateScript";
import { useFocusScriptStore } from "~/stores/scripts/focusScriptStore";
import { SidePanel } from "~/components/ui/SidePanel";
import { useShowCurrentSubscription } from "~/hooks/api/subscriptions/useShowCurrentSubscription";
import { useListPlans } from "~/hooks/api/subscriptions/useListPlans";
import { PaymentRequiredException } from "~/services/httpClient/customHttpExceptions";

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
    const sentinelRef = useRef<HTMLDivElement>(null);
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
            if (error instanceof PaymentRequiredException) {
                return;
            }
            throw error;
        }
    };

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
                    listMore();
                }
            },
            { rootMargin: "0px 0px 200px 0px" },
        );

        observer.observe(sentinel);

        return () => {
            observer.disconnect();
        };
    }, [hasMore, isLoadingMore, listMore]);

    return (
        <SidePanel
            title="Scripts"
            side="left"
            headerActions={
                <button
                    onClick={handleNewScript}
                    disabled={isPending || isLimitReached}
                    className="text-gray hover:text-dark transition-colors disabled:opacity-50 cursor-pointer"
                    title={isLimitReached ? "Limite atteinte pour votre abonnement" : "Nouveau script"}
                >
                    <PlusIcon className="size-4" strokeWidth={2} />
                </button>
            }
        >
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
        </SidePanel>
    );
}
