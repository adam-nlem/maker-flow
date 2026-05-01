import { useRef } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import type { Script } from "~/models/Script";
import ScriptCard from "./ScriptCard";
import { useCreateScript } from "~/hooks/api/scripts/useCreateScript";
import { useFocusScriptStore } from "~/stores/scripts/focusScriptStore";
import { useIsDesktop } from "~/hooks/useIsDesktop";
import { SidePanel } from "~/components/ui/SidePanel";
import { useShowCurrentSubscription } from "~/hooks/api/subscriptions/useShowCurrentSubscription";
import { useListPlans } from "~/hooks/api/subscriptions/useListPlans";
import { useInfiniteScroll } from "~/hooks/useInfiniteScroll";
import { isScriptLimitReached } from "~/utils/subscriptionHelpers";
import { HttpException } from "~/services/httpClient/HttpException";

interface ScriptListPanelProps {
    scripts: Script[];
    projectUuid: string;
    hasMore: boolean;
    isLoadingMore: boolean;
    listMore: () => void;
}

export default function ScriptListPanel({ scripts, projectUuid, hasMore, isLoadingMore, listMore }: ScriptListPanelProps) {
    const { t } = useTranslation();
    const { createScript, isPending } = useCreateScript();
    const focusedScriptUuid = useFocusScriptStore((state) => state.focusedScriptUuid);
    const setFocusedScriptUuid = useFocusScriptStore((state) => state.setFocusedScriptUuid);
    const isDesktop = useIsDesktop();
    const scrollRef = useRef<HTMLDivElement>(null);
    useInfiniteScroll(scrollRef, hasMore, isLoadingMore, listMore);
    const { subscription } = useShowCurrentSubscription();
    const { plans } = useListPlans();
    const isLimitReached = isScriptLimitReached(scripts.length, subscription, plans);

    const handleNewScript = async () => {
        try {
            const newScript = await createScript({ projectUuid, title: t("scripts:newScriptTitle") });
            setFocusedScriptUuid(newScript.uuid);
        } catch (error) {
            if (error instanceof HttpException && error.response.httpStatus === 402) {
                return;
            }
            throw error;
        }
    };

    const createButton = (
        isLimitReached ?
            <p className="text-body-xs text-center ">{t("scripts:limitReached")}</p> :
            <button
                onClick={handleNewScript}
                disabled={isPending || isLimitReached}
                className="text-gray hover:text-dark transition-colors disabled:opacity-50 cursor-pointer"
                title={t("scripts:newScriptTitle")}
            >
                <PlusIcon className="size-4" strokeWidth={2} />
            </button>
    );

    const listContent = (
        <div className="p-3 flex flex-col gap-1">
            {scripts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray">
                    <p className="text-body-sm text-center">{t("scripts:noScripts")}</p>
                    <p className="text-body-xs text-center mt-1">{t("scripts:newScriptHint")}</p>
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

                </>
            )}
        </div>
    );

    if (isDesktop) {
        return (
            <SidePanel title={t("scripts:header")} side="left" headerActions={createButton} bodyRef={scrollRef}>
                {listContent}
            </SidePanel>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-row items-center justify-between px-4 py-4 border-b border-light-gray">
                <h2 className="text-heading-md">{t("scripts:header")}</h2>
                {createButton}
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-none">
                {listContent}
            </div>
        </div>
    );
}
