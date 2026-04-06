import { useListPaginatedScripts } from "~/hooks/api/scripts/useListPaginatedScripts";
import { useFocusScriptStore } from "~/stores/scripts/focusScriptStore";
import ScriptListPanel from "./ScriptListPanel";
import ScriptEditorPanel from "./ScriptEditorPanel";
import GenerateScriptPanel from "./generation/GenerateScriptPanel";
import HookTemplatePanel from "./hookTemplates/HookTemplatePanel";

interface ScriptPageViewProps {
    projectUuid: string;
}

export default function ScriptPageView({ projectUuid }: ScriptPageViewProps) {
    const { scripts, hasMore, isLoadingMore, listMore } = useListPaginatedScripts({ projectUuid });
    const focusedScriptUuid = useFocusScriptStore((s) => s.focusedScriptUuid);
    const setFocusedScriptUuid = useFocusScriptStore((s) => s.setFocusedScriptUuid);

    const focusedScript = scripts.find((s) => s.uuid === focusedScriptUuid) ?? null;

    const listPanel = (
        <ScriptListPanel
            scripts={scripts}
            projectUuid={projectUuid}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            listMore={listMore}
        />
    );

    const emptyState = (
        <div className="flex flex-col items-center justify-center h-full text-gray">
            <p className="text-body-md">Sélectionnez ou créez un script.</p>
        </div>
    );

    const rightPanels = focusedScript && (
        <>
            <GenerateScriptPanel
                key={`generate-${focusedScript.uuid}`}
                scriptUuid={focusedScript.uuid}
                projectUuid={projectUuid}
            />
            <HookTemplatePanel />
        </>
    );

    return (
        <>
            {/* Mobile layout */}
            <div className="flex flex-col h-full overflow-hidden md:hidden">
                {focusedScript ? (
                    <ScriptEditorPanel
                        key={focusedScript.uuid}
                        script={focusedScript}
                        projectUuid={projectUuid}
                        onBack={() => setFocusedScriptUuid(null)}
                    />
                ) : (
                    listPanel
                )}
                {rightPanels}
            </div>

            {/* Desktop layout */}
            <div className="hidden md:flex flex-row h-full overflow-hidden">
                {listPanel}
                <div className="flex-1 overflow-hidden">
                    {focusedScript ? (
                        <ScriptEditorPanel key={focusedScript.uuid} script={focusedScript} projectUuid={projectUuid} />
                    ) : (
                        emptyState
                    )}
                </div>
                {rightPanels}
            </div>
        </>
    );
}
