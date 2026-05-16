import { useRef } from "react";
import { useTranslation } from "react-i18next";
import type { Script } from "~/models/Script";
import ScriptCard from "./ScriptCard";
import { useFocusScriptStore } from "~/stores/scripts/focusScriptStore";
import { useScriptFilterStore } from "~/stores/scripts/scriptFilterStore";
import { useInfiniteScroll } from "~/hooks/useInfiniteScroll";
import SearchBar from "~/components/ui/SearchBar";

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
    const setSearchTerm = useScriptFilterStore((s) => s.setSearchTerm);
    const scrollRef = useRef<HTMLDivElement>(null);
    useInfiniteScroll(scrollRef, hasMore, isLoadingMore, listMore);

    return (
        <div className="flex flex-col h-full flex-1 md:max-w-72 border-r border-pale-gray">
            <div className="p-3">
                <SearchBar
                    placeholder={t("scripts:searchPlaceholder")}
                    setDebouncedSearchTerm={setSearchTerm}
                    focusShortcut={{ key: "f", label: "F" }}
                />
            </div>
            <div ref={scrollRef} className="flex flex-col flex-1 overflow-y-auto scrollbar-none px-3 pb-3 gap-1">
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
        </div>
    );
}
