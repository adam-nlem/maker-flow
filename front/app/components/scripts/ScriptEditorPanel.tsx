import { useEffect, useRef } from "react";
import type { Script } from "~/models/Script";
import ScriptMetaHeader from "./ScriptMetaHeader";
import ScriptPartsList from "./parts/ScriptPartsList";
import { useListScriptParts } from "~/hooks/api/scripts/useListScriptParts";
import Shimmer from "~/components/ui/Shimmer";
import GenerationStatusBanner from "./generation/GenerationStatusBanner";
import GenerationHistoryBar from "./generation/GenerationHistoryBar";
import { useScriptRightPanelStore } from "~/stores/scripts/scriptRightPanelStore";
import { ScriptRightPanel } from "~/models/enums/ScriptRightPanel";
import { useScriptGenerationStore } from "~/stores/scripts/scriptGenerationStore";
import { useListScriptGenerations } from "~/hooks/api/scriptGenerations/useListScriptGenerations";
import { ScriptGenerationStatus } from "~/models/enums/ScriptGenerationStatus";

interface ScriptEditorPanelProps {
    script: Script;
    projectUuid: string;
    isReadOnly?: boolean;
    hidePanelTriggers?: boolean;
    onOpenEditor?: () => void;
}

export default function ScriptEditorPanel({ script, projectUuid, isReadOnly, hidePanelTriggers, onOpenEditor }: ScriptEditorPanelProps) {
    const focusedGenerationUuid = useScriptGenerationStore((s) => s.focusedGenerationUuid);
    const setFocusedGenerationUuid = useScriptGenerationStore((s) => s.setFocusedGenerationUuid);
    const { generations } = useListScriptGenerations({ scriptUuid: script.uuid });
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (hasInitialized.current || generations.length === 0) return;
        hasInitialized.current = true;
        if (useScriptGenerationStore.getState().focusedGenerationUuid !== undefined) return;
        const latestCompleted = generations.find((g) => g.status === ScriptGenerationStatus.Completed);
        if (latestCompleted) {
            setFocusedGenerationUuid(latestCompleted.uuid);
        }
    }, [generations, setFocusedGenerationUuid]);

    const { parts, isLoading } = useListScriptParts({ scriptUuid: script.uuid, generationUuid: focusedGenerationUuid });
    const togglePanel = useScriptRightPanelStore((s) => s.togglePanel);

    return (
        <div className="flex-1 h-full flex flex-col overflow-hidden">
            <ScriptMetaHeader
                script={script}
                projectUuid={projectUuid}
                onOpenGenerateModal={() => togglePanel(ScriptRightPanel.Generate)}
                isReadOnly={isReadOnly}
                hidePanelTriggers={hidePanelTriggers}
                onOpenEditor={onOpenEditor}
            />

            <GenerationHistoryBar
                scriptUuid={script.uuid}
                selectedGenerationUuid={focusedGenerationUuid}
                onSelectGeneration={setFocusedGenerationUuid}
                isReadOnly={isReadOnly}
            />

            <GenerationStatusBanner scriptUuid={script.uuid} />

            {isLoading ? (
                <div className="flex flex-col gap-3 px-6 py-4">
                    <Shimmer height="h-20" width="w-full" />
                    <Shimmer height="h-20" width="w-full" />
                    <Shimmer height="h-16" width="w-full" />
                </div>
            ) : (
                <ScriptPartsList parts={parts} script={script} generationUuid={focusedGenerationUuid} isReadOnly={isReadOnly} hidePanelTriggers={hidePanelTriggers} />
            )}
        </div>
    );
}
