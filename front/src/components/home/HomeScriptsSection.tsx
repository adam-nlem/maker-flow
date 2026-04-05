import { useState } from "react";
import { DndContext, DragOverlay, PointerSensor, type DragEndEvent, type DragStartEvent, useSensor, useSensors } from "@dnd-kit/core";
import type { Script } from "~/models/Script";
import { useUpdateScript } from "~/hooks/api/scripts/useUpdateScript";
import { useCalendarStore } from "~/stores/scripts/calendarStore";
import ScriptTile from "~/components/scripts/ScriptTile";
import HomeScriptsList from "./HomeScriptsList";
import ScriptCalendar from "../scripts/calendar/ScriptCalendar";


interface HomeScriptsSectionProps {
    projectUuid: string;
}

export default function HomeScriptsSection({ projectUuid }: HomeScriptsSectionProps) {
    const { currentMonth, currentYear } = useCalendarStore();
    const { updateScript } = useUpdateScript();
    const [draggedScript, setDraggedScript] = useState<Script | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const script = event.active.data.current?.script as Script | undefined;
        setDraggedScript(script ?? null);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setDraggedScript(null);
        if (!over) return;

        const dayStr = (over.id as string).replace("day-", "");
        const day = parseInt(dayStr, 10);
        if (isNaN(day)) return;

        const newDate = new Date(currentYear, currentMonth, day);
        await updateScript({ scriptUuid: active.id as string, data: { publishedAt: newDate } });
    };

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <HomeScriptsList projectUuid={projectUuid} />
            <div className="hidden md:flex md:flex-col flex-1 min-h-0">
                <ScriptCalendar projectUuid={projectUuid} />
            </div>

            <DragOverlay dropAnimation={null}>
                {draggedScript && (
                    <div className="opacity-90 rotate-1 shadow-lg">
                        <ScriptTile script={draggedScript} onClick={() => { }} />
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
}
