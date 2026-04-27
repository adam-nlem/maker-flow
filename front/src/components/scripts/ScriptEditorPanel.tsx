import type { Script } from "~/models/Script";
import ScriptMetaHeader from "./ScriptMetaHeader";
import ScriptPartsList from "./parts/ScriptPartsList";
import { useListScriptParts } from "~/hooks/api/scripts/useListScriptParts";
import Shimmer from "~/components/ui/Shimmer";
import { useScriptRightPanelStore } from "~/stores/scripts/scriptRightPanelStore";
import { ScriptRightPanel } from "~/models/enums/ScriptRightPanel";

interface ScriptEditorPanelProps {
    script: Script;
    projectUuid: string;
    isReadOnly?: boolean;
    hidePanelTriggers?: boolean;
    onOpenEditor?: () => void;
    onBack?: () => void;
}

export default function ScriptEditorPanel({ script, projectUuid, isReadOnly, hidePanelTriggers, onOpenEditor, onBack }: ScriptEditorPanelProps) {
    const { parts, isLoading } = useListScriptParts({ scriptUuid: script.uuid });
    const togglePanel = useScriptRightPanelStore((s) => s.togglePanel);

    return (
        <div className="flex-1 h-full flex flex-col overflow-hidden">
            <ScriptMetaHeader
                script={script}
                projectUuid={projectUuid}
                onOpenGenerateModal={() => togglePanel(ScriptRightPanel.Generate)}
                onOpenChat={() => togglePanel(ScriptRightPanel.Chat)}
                isReadOnly={isReadOnly}
                hidePanelTriggers={hidePanelTriggers}
                onOpenEditor={onOpenEditor}
                onBack={onBack}
            />

            {isLoading ? (
                <div className="flex flex-col gap-3 px-6 py-4">
                    <Shimmer height="h-20" width="w-full" />
                    <Shimmer height="h-20" width="w-full" />
                    <Shimmer height="h-16" width="w-full" />
                </div>
            ) : (
                <ScriptPartsList
                    parts={parts}
                    script={script}
                    isReadOnly={isReadOnly}
                />
            )}
        </div>
    );
}
