import { useState } from "react";
import { Bars3Icon, TrashIcon } from "@heroicons/react/24/outline";
import type { ScriptText } from "~/models/ScriptText";
import { TextArea } from "~/components/ui/TextArea";
import { useCreateScriptText } from "~/hooks/api/scriptTexts/useCreateScriptText";
import { useUpdateScriptText } from "~/hooks/api/scriptTexts/useUpdateScriptText";
import { useDeleteScriptText } from "~/hooks/api/scriptTexts/useDeleteScriptText";

interface Props {
    text?: ScriptText;
    scriptUuid: string;
    dragHandleProps?: Record<string, unknown>;
}

export default function ScriptTextCard({ text, scriptUuid, dragHandleProps }: Props) {
    const [content, setContent] = useState(text?.content ?? "");

    const { createScriptText } = useCreateScriptText();
    const { updateScriptText } = useUpdateScriptText();
    const { deleteScriptText, isPending: isDeleting } = useDeleteScriptText();

    const handleBlur = async () => {
        if (text) {
            if (content.trim() !== text.content) {
                await updateScriptText({ textUuid: text.uuid, scriptUuid, data: { content: content.trim() } });
            }
        } else {
            if (content.trim()) {
                await createScriptText({ scriptUuid, content: content.trim() });
                setContent("");
            }
        }
    };

    return (
        <div className="group flex flex-row items-start gap-3">
            {text && (
                <div
                    {...dragHandleProps}
                    className="shrink-0 mt-1 text-gray opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
                >
                    <Bars3Icon className="size-4" strokeWidth={2} />
                </div>
            )}

            <div className="flex-1 min-w-0">
                <TextArea
                    simple
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onBlur={handleBlur}
                    placeholder="Ecrivez ici..."
                    textStyle="text-body-sm"
                    fullWidth
                />
            </div>

            {text && (
                <button
                    onClick={() => deleteScriptText({ textUuid: text.uuid, scriptUuid })}
                    disabled={isDeleting}
                    className="shrink-0 mt-1 text-gray hover:text-danger transition-colors cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <TrashIcon className="size-4" strokeWidth={2} />
                </button>
            )}
        </div>
    );
}
