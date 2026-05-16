import { useRef } from "react";
import { useTranslation } from "react-i18next";
import type { Script } from "~/models/Script";
import ScriptCard from "./ScriptCard";
import { useFocusScriptStore } from "~/stores/scripts/focusScriptStore";
import { useIsDesktop } from "~/hooks/useIsDesktop";
import { SidePanel } from "~/components/ui/SidePanel";
import { useInfiniteScroll } from "~/hooks/useInfiniteScroll";

interface ScriptListPanelProps {
    scripts: Script[];
    hasMore: boolean;
    isLoadingMore: boolean;
    listMore: () => void;
}

export default function ScriptListPanel({ scripts, hasMore, isLoadingMore, listMore }: ScriptListPanelProps) {
    const { t } = useTranslation();
    const focusedScriptUuid = useFocusScriptStore((state) => state.focusedScriptUuid);
    const setFocusedScriptUuid = useFocusScriptStore((state) => state.setFocusedScriptUuid);
    const isDesktop = useIsDesktop();
    const scrollRef = useRef<HTMLDivElement>(null);
    useInfiniteScroll(scrollRef, hasMore, isLoadingMore, listMore);

    const listContent = (
        <div className="p-3 flex flex-col gap-1">
            {scripts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-2">
                    <p className="text-body-sm text-center">{t("scripts:noScripts")}</p>
                    <p className="text-body-xs text-center mt-1">{t("scripts:newScriptHint")}</p>
                </div>
            ) : (
                scripts.map((script) => (
                    <ScriptCard
                        key={script.uuid}
                        script={script}
                        isSelected={script.uuid === focusedScriptUuid}
                        onClick={() => setFocusedScriptUuid(script.uuid)}
                    />
                ))
            )}
        </div>
    );

    if (isDesktop) {
        return (
            <SidePanel title={t("scripts:header")} side="left" bodyRef={scrollRef}>
                {listContent}
            </SidePanel>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-row items-center px-4 py-4 border-b border-pale-gray">
                <h2 className="text-heading-md">{t("scripts:header")}</h2>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-none">
                {listContent}
            </div>
        </div>
    );
}
