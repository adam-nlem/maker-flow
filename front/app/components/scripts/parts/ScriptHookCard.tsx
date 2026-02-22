import { useState } from "react";
import { BookOpenIcon, CheckBadgeIcon, InboxStackIcon } from "@heroicons/react/24/outline";
import type { Script } from "~/models/Script";
import { Button } from "~/components/ui/Button";
import { TextArea } from "~/components/ui/TextArea";
import { useUpdateScript } from "~/hooks/api/scripts/useUpdateScript";
import { useHookTemplatePanelStore } from "~/stores/scripts/hookTemplatePanelStore";
import { hasPlaceholders, replacePlaceholder } from "~/helpers/hookPlaceholderParser";
import ScriptPartHeader from "./ScriptPartHeader";
import HookContentRenderer from "./HookContentRenderer";

interface ScriptHookCardProps {
    script: Script;
}

export default function ScriptHookCard({ script }: ScriptHookCardProps) {
    const [hook, setHook] = useState(script.hook ?? "");
    const { updateScript } = useUpdateScript();

    const toggleHookTemplatePanel = useHookTemplatePanelStore((s) => s.toggle);
    const hasLinkedTemplate = script.hookTemplate !== undefined;

    const handleHookBlur = () => {
        const newHook = hook.trim() || null;
        if (newHook !== (script.hook ?? null)) {
            updateScript({ scriptUuid: script.uuid, data: { hook: newHook } });
        }
    };

    const handleReplacePlaceholder = (placeholder: string, value: string) => {
        const updated = replacePlaceholder(hook, placeholder, value);
        setHook(updated);
        updateScript({ scriptUuid: script.uuid, data: { hook: updated } });
    };

    return (
        <div className="group border border-light-gray rounded-xl p-4 bg-clear flex flex-col gap-2 mb-3">

            <ScriptPartHeader icon={CheckBadgeIcon} label="Hook" colorClassName="bg-primary/10 border border-primary/30" />
            {hasPlaceholders(hook) ? (
                <HookContentRenderer content={hook} onReplacePlaceholder={handleReplacePlaceholder} />
            ) : (
                <TextArea
                    simple
                    value={hook}
                    onChange={(e) => setHook(e.target.value)}
                    onBlur={handleHookBlur}
                    placeholder="Hook..."
                    textStyle="text-sm"
                    fullWidth
                />
            )}

            <Button
                style={"secondary"}
                onClick={toggleHookTemplatePanel}
                width="w-fit"
                height="h-7"
            >
                <div className="flex flex-row justify-center items-center gap-2 shrink-0">
                    <InboxStackIcon className="size-4" strokeWidth={2} />
                    <p className="text-sm">Blibliothèque de hooks</p>
                </div>
            </Button>
        </div>
    );
}
