import { useEffect, useState } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";

import { TextArea } from "~/components/ui/TextArea";
import type { ScriptPart } from "~/models/ScriptPart";
import { ScriptPartType } from "~/models/enums/ScriptPartType";
import { useUpdateScriptPart } from "~/hooks/api/scripts/useUpdateScriptPart";
import { useDeleteScriptPart } from "~/hooks/api/scripts/useDeleteScriptPart";
import { useCreateScriptPart } from "~/hooks/api/scripts/useCreateScriptPart";
import ScriptPartCard from "./ScriptPartCard";

interface ScriptPartRowProps {
    part: ScriptPart;
    scriptUuid: string;
    isReadOnly?: boolean;
    isDragDisabled?: boolean;
}

export default function ScriptPartRow({ part, scriptUuid, isReadOnly, isDragDisabled }: ScriptPartRowProps) {
    const [content, setContent] = useState(part.content);

    useEffect(() => {
        setContent(part.content);
    }, [part.content]);

    const { updateScriptPart } = useUpdateScriptPart();
    const { deleteScriptPart, isPending: isDeleting } = useDeleteScriptPart();
    const { createScriptPart } = useCreateScriptPart();

    const dragDisabled = isReadOnly || isDragDisabled;
    const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({ id: part.uuid, disabled: dragDisabled });
    const { setNodeRef: setDropRef } = useDroppable({ id: part.uuid, disabled: dragDisabled });

    const persistContent = async () => {
        if (isReadOnly) return;
        const trimmed = content.trim();
        if (trimmed === part.content) return;
        await updateScriptPart({ scriptUuid, partUuid: part.uuid, content: trimmed });
    };

    const handleEnter = async () => {
        if (isReadOnly) return;
        await persistContent();
        await createScriptPart({
            scriptUuid,
            content: "",
            type: ScriptPartType.Text,
            position: part.position + 1,
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleEnter();
        }
    };

    return (
        <div
            ref={(node) => { setDragRef(node); setDropRef(node); }}
            className={isDragging ? "opacity-40" : ""}
        >
            <ScriptPartCard
                partType={part.type}
                dragHandleProps={dragDisabled ? undefined : { ...attributes, ...listeners }}
                bordered={false}
                onDelete={isReadOnly ? undefined : () => deleteScriptPart({ scriptUuid, partUuid: part.uuid })}
                isDeleting={isDeleting}
            >
                <TextArea
                    simple
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onBlur={persistContent}
                    onKeyDown={handleKeyDown}
                    readOnly={isReadOnly}
                    placeholder="Écrivez ici..."
                    textStyle="text-sm"
                />
            </ScriptPartCard>
        </div>
    );
}
