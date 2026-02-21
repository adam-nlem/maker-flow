import { useState } from "react";
import { DndContext, DragOverlay, PointerSensor, type DragEndEvent, type DragStartEvent, useSensor, useSensors, useDroppable, useDraggable } from "@dnd-kit/core";
import type { ScriptPart } from "~/models/ScriptPart";
import type { ScriptChapter } from "~/models/ScriptChapter";
import type { ScriptVoiceOver } from "~/models/ScriptVoiceOver";
import type { ScriptDialogue } from "~/models/ScriptDialogue";
import type { ScriptShot } from "~/models/ScriptShot";
import type { ScriptText } from "~/models/ScriptText";
import ScriptChapterCard from "./ScriptChapterCard";
import ScriptVoiceOverCard from "./ScriptVoiceOverCard";
import ScriptDialogueCard from "./ScriptDialogueCard";
import ScriptShotCard from "./ScriptShotCard";
import ScriptTextCard from "./ScriptTextCard";
import AddScriptPartMenu from "./AddScriptPartMenu";
import { useReorderScriptParts } from "~/hooks/api/scripts/useReorderScriptParts";

interface Props {
    parts: ScriptPart[];
    scriptUuid: string;
}

interface DraggablePartProps {
    part: ScriptPart;
    scriptUuid: string;
}

function DraggablePart({ part, scriptUuid }: DraggablePartProps) {
    const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({ id: part.uuid });
    const { setNodeRef: setDropRef } = useDroppable({ id: part.uuid });

    return (
        <div
            ref={(node) => { setDragRef(node); setDropRef(node); }}
            className={isDragging ? "opacity-40" : ""}
        >
            {renderPartCard(part, scriptUuid, { ...attributes, ...listeners })}
        </div>
    );
}

interface DroppableZoneProps {
    id: string;
    children: React.ReactNode;
}

function DroppableZone({ id, children }: DroppableZoneProps) {
    const { setNodeRef, isOver } = useDroppable({ id });
    return (
        <div ref={setNodeRef} className={`flex flex-col gap-3 min-h-8 rounded-lg transition-colors ${isOver ? "bg-primary/5" : ""}`}>
            {children}
        </div>
    );
}

function renderPartCard(part: ScriptPart, scriptUuid: string, dragHandleProps?: Record<string, unknown>) {
    switch (part.type) {
        case "chapter":
            return <ScriptChapterCard chapter={part as ScriptChapter} scriptUuid={scriptUuid} dragHandleProps={dragHandleProps} />;
        case "voice_over":
            return <ScriptVoiceOverCard voiceOver={part as ScriptVoiceOver} scriptUuid={scriptUuid} dragHandleProps={dragHandleProps} />;
        case "dialogue":
            return <ScriptDialogueCard dialogue={part as ScriptDialogue} scriptUuid={scriptUuid} dragHandleProps={dragHandleProps} />;
        case "shot":
            return <ScriptShotCard shot={part as ScriptShot} scriptUuid={scriptUuid} dragHandleProps={dragHandleProps} />;
        case "text":
            return <ScriptTextCard text={part as ScriptText} scriptUuid={scriptUuid} dragHandleProps={dragHandleProps} />;
    }
}

export default function ScriptPartsList({ parts, scriptUuid }: Props) {
    const [localParts, setLocalParts] = useState<ScriptPart[]>(parts);
    const [activePart, setActivePart] = useState<ScriptPart | null>(null);

    const { reorderScriptParts } = useReorderScriptParts();

    // Keep local state in sync when parts prop changes (e.g. after server invalidation)
    if (parts !== localParts && !activePart) {
        setLocalParts(parts);
    }

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const part = localParts.find((p) => p.uuid === event.active.id);
        setActivePart(part ?? null);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActivePart(null);
        if (!over || active.id === over.id) return;

        const oldIndex = localParts.findIndex((p) => p.uuid === active.id);
        const newIndex = localParts.findIndex((p) => p.uuid === over.id);
        if (oldIndex === -1 || newIndex === -1) return;

        const reordered = [...localParts];
        const [moved] = reordered.splice(oldIndex, 1);
        reordered.splice(newIndex, 0, moved);

        setLocalParts(reordered);

        await reorderScriptParts({
            scriptUuid,
            orderedParts: reordered.map((p) => ({ uuid: p.uuid, type: p.type })),
        });
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-none">
                <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    <DroppableZone id="parts-list">
                        {localParts.map((part) => (
                            <DraggablePart key={part.uuid} part={part} scriptUuid={scriptUuid} />
                        ))}
                    </DroppableZone>

                    {localParts.length === 0 && (
                        <ScriptTextCard scriptUuid={scriptUuid} />
                    )}

                    <DragOverlay>
                        {activePart && (
                            <div className="opacity-90 rotate-1 shadow-lg">
                                {renderPartCard(activePart, scriptUuid)}
                            </div>
                        )}
                    </DragOverlay>
                </DndContext>
            </div>

            <div className="px-6 py-4 border-t border-light-gray">
                <AddScriptPartMenu scriptUuid={scriptUuid} />
            </div>
        </div>
    );
}
