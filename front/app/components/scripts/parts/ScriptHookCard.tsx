import { useState, useEffect } from "react";
import { InboxStackIcon } from "@heroicons/react/24/outline";
import type { ScriptHook } from "~/models/ScriptHook";
import type { HookTemplate } from "~/models/HookTemplate";
import { ScriptPartType } from "~/models/enums/ScriptPartType";
import { ScriptRightPanel } from "~/models/enums/ScriptRightPanel";
import { TextArea } from "~/components/ui/TextArea";
import { useUpdateScriptHook } from "~/hooks/api/scriptHooks/useUpdateScriptHook";
import { useDeleteScriptHook } from "~/hooks/api/scriptHooks/useDeleteScriptHook";
import { useScriptRightPanelStore } from "~/stores/scripts/scriptRightPanelStore";
import { useHookTemplateStore } from "~/stores/scripts/hookTemplateStore";
import { hasPlaceholders, replacePlaceholder } from "~/helpers/hookPlaceholderParser";
import HookContentRenderer from "./HookContentRenderer";
import ScriptPartCard from "./ScriptPartCard";
import ApplyHookTemplateModal from "../hookTemplates/ApplyHookTemplateModal";

interface ScriptHookCardProps {
    hook: ScriptHook;
    scriptUuid: string;
}

export default function ScriptHookCard({ hook, scriptUuid }: ScriptHookCardProps) {
    const [content, setContent] = useState(hook.content);
    const [pendingTemplate, setPendingTemplate] = useState<HookTemplate | null>(null);

    const { updateScriptHook } = useUpdateScriptHook();
    const { deleteScriptHook, isPending: isDeleting } = useDeleteScriptHook();
    const togglePanel = useScriptRightPanelStore((s) => s.togglePanel);

    const selectedTemplate = useHookTemplateStore((s) => s.selectedTemplate);
    const setSelectedTemplate = useHookTemplateStore((s) => s.setSelectedTemplate);
    const setFocusedHookTemplateUuid = useHookTemplateStore((s) => s.setFocusedHookTemplateUuid);

    // Sync the currently applied template UUID to the store (for highlight in HookTemplatePanel)
    useEffect(() => {
        setFocusedHookTemplateUuid(hook.hookTemplate?.uuid ?? null);
        return () => setFocusedHookTemplateUuid(null);
    }, [hook.hookTemplate?.uuid, setFocusedHookTemplateUuid]);

    // React to template selection from HookTemplatePanel
    useEffect(() => {
        if (!selectedTemplate) return;

        if (content.trim().length > 0) {
            setPendingTemplate(selectedTemplate);
        } else {
            applyTemplate(selectedTemplate);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTemplate]);

    const applyTemplate = async (template: HookTemplate) => {
        await updateScriptHook({
            hookUuid: hook.uuid,
            scriptUuid,
            data: { content: template.content, hookTemplateUuid: template.uuid },
        });
        setPendingTemplate(null);
        setSelectedTemplate(null);
    };

    const handleBlur = async () => {
        if (content.trim() !== hook.content) {
            await updateScriptHook({ hookUuid: hook.uuid, scriptUuid, data: { content: content.trim() } });
        }
    };

    const handleReplacePlaceholder = async (placeholder: string, value: string) => {
        const newContent = replacePlaceholder(content, placeholder, value);
        setContent(newContent);
        await updateScriptHook({ hookUuid: hook.uuid, scriptUuid, data: { content: newContent } });
    };

    return (
        <>
            <ScriptPartCard
                partType={ScriptPartType.Hook}
                onDelete={() => deleteScriptHook({ hookUuid: hook.uuid, scriptUuid })}
                isDeleting={isDeleting}
                headerActions={
                    <button
                        onClick={() => togglePanel(ScriptRightPanel.HookTemplates)}
                        className="text-gray hover:text-dark transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                        title="Bibliothèque de hooks"
                    >
                        <InboxStackIcon className="size-4" strokeWidth={2} />
                    </button>
                }
            >
                {hasPlaceholders(content) ? (
                    <HookContentRenderer content={content} onReplacePlaceholder={handleReplacePlaceholder} />
                ) : (
                    <TextArea
                        simple
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onBlur={handleBlur}
                        placeholder="Hook..."
                        textStyle="text-sm"
                        fullWidth
                    />
                )}
            </ScriptPartCard>

            <ApplyHookTemplateModal
                isOpen={pendingTemplate !== null}
                template={pendingTemplate}
                onConfirm={() => pendingTemplate && applyTemplate(pendingTemplate)}
                onCancel={() => {
                    setPendingTemplate(null);
                    setSelectedTemplate(null);
                }}
            />
        </>
    );
}
