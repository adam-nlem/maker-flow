import { useEffect, useState } from "react";
import { useListPaginatedScripts } from "~/hooks/api/scripts/useListPaginatedScripts";
import { useUpdateScript } from "~/hooks/api/scripts/useUpdateScript";
import { useFocusScriptStore } from "~/stores/scripts/focusScriptStore";
import type { HookTemplate } from "~/models/HookTemplate";
import ScriptListPanel from "./ScriptListPanel";
import ScriptEditorPanel from "./ScriptEditorPanel";
import HookTemplatePanel from "./hookTemplates/HookTemplatePanel";
import ApplyHookTemplateModal from "./hookTemplates/ApplyHookTemplateModal";

interface ScriptPageViewProps {
    projectUuid: string;
}

export default function ScriptPageView({ projectUuid }: ScriptPageViewProps) {
    const { scripts, hasMore, isLoadingMore, listMore } = useListPaginatedScripts({ projectUuid });
    const focusedScriptUuid = useFocusScriptStore((s) => s.focusedScriptUuid);
    const setFocusedScriptUuid = useFocusScriptStore((s) => s.setFocusedScriptUuid);
    const { updateScript } = useUpdateScript();
    const [pendingTemplate, setPendingTemplate] = useState<HookTemplate | null>(null);

    // Auto-select first script if none is selected or the stored UUID is no longer in the list
    useEffect(() => {
        if (scripts.length === 0) return;
        const isValid = scripts.some((s) => s.uuid === focusedScriptUuid);
        if (!isValid) setFocusedScriptUuid(scripts[0].uuid);
    }, [scripts, focusedScriptUuid, setFocusedScriptUuid]);

    const focusedScript = scripts.find((s) => s.uuid === focusedScriptUuid) ?? null;

    const handleApplyTemplate = (template: HookTemplate) => {
        if (!focusedScript) return;

        if (focusedScript.hook && focusedScript.hook.trim().length > 0) {
            setPendingTemplate(template);
        } else {
            applyTemplate(template);
        }
    };

    const applyTemplate = (template: HookTemplate) => {
        if (!focusedScript) return;
        updateScript({
            scriptUuid: focusedScript.uuid,
            data: { hook: template.content, hookTemplateUuid: template.uuid },
        });
        setPendingTemplate(null);
    };

    return (
        <div className="flex flex-row h-screen overflow-hidden">
            <ScriptListPanel
                scripts={scripts}
                projectUuid={projectUuid}
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
                listMore={listMore}
            />

            <div className="flex-1 overflow-hidden">
                {focusedScript ? (
                    <ScriptEditorPanel key={focusedScript.uuid} script={focusedScript} projectUuid={projectUuid} />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray">
                        <p className="text-body-md">Sélectionnez ou créez un script.</p>
                    </div>
                )}
            </div>

            {focusedScript && (
                <HookTemplatePanel
                    scripts={scripts}
                    focusedScript={focusedScript}
                    onApplyTemplate={handleApplyTemplate}
                />
            )}

            <ApplyHookTemplateModal
                isOpen={pendingTemplate !== null}
                template={pendingTemplate}
                onConfirm={() => pendingTemplate && applyTemplate(pendingTemplate)}
                onCancel={() => setPendingTemplate(null)}
            />
        </div>
    );
}
