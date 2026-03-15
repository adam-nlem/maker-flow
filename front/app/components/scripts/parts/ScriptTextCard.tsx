import { useState } from "react";
import type { ScriptText } from "~/models/ScriptText";
import { ScriptPartType } from "~/models/enums/ScriptPartType";
import { TextArea } from "~/components/ui/TextArea";
import { useCreateScriptText } from "~/hooks/api/scriptTexts/useCreateScriptText";
import { useUpdateScriptText } from "~/hooks/api/scriptTexts/useUpdateScriptText";
import { useDeleteScriptText } from "~/hooks/api/scriptTexts/useDeleteScriptText";
import ScriptPartCard from "./ScriptPartCard";

interface ScriptTextCardProps {
    text?: ScriptText;
    scriptUuid: string;
    dragHandleProps?: Record<string, unknown>;
    isReadOnly?: boolean;
}

export default function ScriptTextCard({ text, scriptUuid, dragHandleProps, isReadOnly }: ScriptTextCardProps) {
    const [content, setContent] = useState(text?.content ?? "");

    const { createScriptText } = useCreateScriptText();
    const { updateScriptText } = useUpdateScriptText();
    const { deleteScriptText, isPending: isDeleting } = useDeleteScriptText();

    const handleBlur = async () => {
        if (isReadOnly) return;
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
        <ScriptPartCard
            partType={ScriptPartType.Text}
            dragHandleProps={dragHandleProps}
            bordered={false}
            onDelete={isReadOnly ? undefined : (text ? () => deleteScriptText({ textUuid: text.uuid, scriptUuid }) : undefined)}
            isDeleting={isDeleting}
        >
            <TextArea
                simple
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onBlur={handleBlur}
                readOnly={isReadOnly}
                placeholder="Ecrivez ici..."
                textStyle="text-sm"
            />
        </ScriptPartCard>
    );
}
