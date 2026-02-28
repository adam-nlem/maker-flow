import { useState } from "react";
import { BookOpenIcon, CheckBadgeIcon, InboxStackIcon } from "@heroicons/react/24/outline";
import type { Script } from "~/models/Script";
import { Button } from "~/components/ui/Button";
import { TextArea } from "~/components/ui/TextArea";
import { useUpdateScript } from "~/hooks/api/scripts/useUpdateScript";
import { useScriptRightPanelStore } from "~/stores/scripts/scriptRightPanelStore";
import { ScriptRightPanel } from "~/models/enums/ScriptRightPanel";
import { hasPlaceholders, replacePlaceholder } from "~/helpers/hookPlaceholderParser";

import HookContentRenderer from "./HookContentRenderer";
import { useScriptEditorStore } from "~/stores/scripts/scriptEditorStore";
import Pill from "~/components/ui/Pill";

interface ScriptHookCardProps {
    script: Script;
}

export default function ScriptHookCard({ script }: ScriptHookCardProps) {
    const [hook, setHook] = useState(script.hook ?? "");
    const { updateScript } = useUpdateScript();
    const isExpanded = useScriptEditorStore((s) => s.isExpanded);

    const togglePanel = useScriptRightPanelStore((s) => s.togglePanel);

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
        <div className="group border border-red/30 rounded-xl p-4 bg-clear flex flex-col gap-2 mb-3">
            <Pill icon={CheckBadgeIcon} isSelected label="Hook"  bgColorClassName="bg-red/10" borderColorClassName="border border-red/30" />
            
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
            {isExpanded &&
                <Button
                    style={"secondary"}
                    onClick={() => togglePanel(ScriptRightPanel.HookTemplates)}
                    width="w-fit"
                    height="h-7"
                >
                    <div className="flex flex-row justify-center items-center gap-2 shrink-0">
                        <InboxStackIcon className="size-4" strokeWidth={2} />
                        <p className="text-sm">Blibliothèque de hooks</p>
                    </div>
                </Button>}
        </div>
    );
}
