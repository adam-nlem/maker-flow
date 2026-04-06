import { useState } from "react";
import { DndContext, DragOverlay, PointerSensor, TouchSensor, type DragEndEvent, type DragStartEvent, useSensor, useSensors } from "@dnd-kit/core";
import { useListPaginatedProjects } from "~/hooks/api/projects/useListPaginatedProjects";
import useSelectFocusedProject from "~/hooks/api/projects/useSelectFocusedProject";

import CalendarFilterPanel from "~/components/scripts/calendar/CalendarFilterPanel";
import ScriptTile from "~/components/scripts/ScriptTile";
import type { Script } from "~/models/Script";
import { useUpdateScript } from "~/hooks/api/scripts/useUpdateScript";
import { useCalendarStore } from "~/stores/scripts/calendarStore";
import ScriptCalendar from "~/components/scripts/calendar/ScriptCalendar";

export default function CalendarPage() {
  const { projects } = useListPaginatedProjects()
  const { focusedProjectUuid } = useSelectFocusedProject({ projects })
  const focusedProject = projects.find((p) => p.uuid === focusedProjectUuid) ?? null

  const { currentMonth, currentYear } = useCalendarStore();
  const { updateScript } = useUpdateScript();
  const [draggedScript, setDraggedScript] = useState<Script | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
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
    <div className="p-3 md:p-5 h-full overflow-y-auto md:overflow-hidden flex flex-col gap-3 md:gap-5">
      <h1 className="text-heading-xl">Calendrier</h1>
      {focusedProject && (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <CalendarFilterPanel projectUuid={focusedProject.uuid} />
          <ScriptCalendar projectUuid={focusedProject.uuid} />

          <DragOverlay dropAnimation={null}>
            {draggedScript && (
              <div className="opacity-90 rotate-1 shadow-lg">
                <ScriptTile script={draggedScript} onClick={() => { }} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
