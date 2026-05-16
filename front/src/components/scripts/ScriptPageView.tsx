import { useTranslation } from "react-i18next";
import { useListPaginatedScripts } from "~/hooks/api/scripts/useListPaginatedScripts";
import { useFocusScriptStore } from "~/stores/scripts/focusScriptStore";
import { useIsDesktop } from "~/hooks/useIsDesktop";
import ScriptListPanel from "./ScriptListPanel";
import ScriptEditorPanel from "./ScriptEditorPanel";
import ChatPanel from "./chat/ChatPanel";
import ChatHistoryPanel from "./chat/ChatHistoryPanel";
import HookTemplatePanel from "./hookTemplates/HookTemplatePanel";

interface ScriptPageViewProps {
    projectUuid: string;
}

export default function ScriptPageView({ projectUuid }: ScriptPageViewProps) {
    const { t } = useTranslation();
    const { scripts, hasMore, isLoadingMore, listMore } = useListPaginatedScripts({ projectUuid });
    const focusedScriptUuid = useFocusScriptStore((s) => s.focusedScriptUuid);
    const setFocusedScriptUuid = useFocusScriptStore((s) => s.setFocusedScriptUuid);
    const isDesktop = useIsDesktop();

    const focusedScript = scripts.find((s) => s.uuid === focusedScriptUuid) ?? null;

    const listPanel = (
        <ScriptListPanel
            scripts={scripts}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            listMore={listMore}
        />
    );

    const rightPanels = focusedScript && (
        <>
            <ChatPanel
                key={`chat-${focusedScript.uuid}`}
                scriptUuid={focusedScript.uuid}
                projectUuid={projectUuid}
            />
            <ChatHistoryPanel
                key={`chat-history-${focusedScript.uuid}`}
                scriptUuid={focusedScript.uuid}
            />
            <HookTemplatePanel />
        </>
    );

    if (!isDesktop) {
        return (
            <div className="flex flex-col h-full overflow-hidden">
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
        );
    }

    return (
        <div className="flex flex-row h-full overflow-hidden">
            {listPanel}
            <div className="flex-1 overflow-hidden">
                {focusedScript ? (
                    <ScriptEditorPanel key={focusedScript.uuid} script={focusedScript} projectUuid={projectUuid} />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-2">
                        <p className="text-body-md">{t("scripts:selectOrCreate")}</p>
                    </div>
                )}
            </div>
            {rightPanels}
        </div>
    );
}
