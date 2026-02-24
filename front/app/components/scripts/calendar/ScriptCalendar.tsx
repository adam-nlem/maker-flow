import { useMemo, useState } from "react";
import { DndContext, DragOverlay, PointerSensor, type DragEndEvent, type DragStartEvent, useSensor, useSensors } from "@dnd-kit/core";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import type { Script } from "~/models/Script";
import { useUpdateScript } from "~/hooks/api/scripts/useUpdateScript";
import { useCreateScript } from "~/hooks/api/scripts/useCreateScript";
import { useListCalendarScripts } from "~/hooks/api/scripts/useListCalendarScripts";
import { DAYS_FR, MONTHS_FR, getDaysInMonth, getFirstDayOfMonth, isSameDay, toDateKey } from "~/utils/dateHelpers";
import ScriptCalendarDayCell from "./ScriptCalendarDayCell";
import ScriptCalendarCard from "./ScriptCalendarCard";
import ScriptDetailModal from "./ScriptDetailModal";

interface ScriptCalendarProps {
    projectUuid: string;
}

export default function ScriptCalendar({ projectUuid }: ScriptCalendarProps) {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [draggedScript, setDraggedScript] = useState<Script | null>(null);
    const [selectedScript, setSelectedScript] = useState<Script | null>(null);

    const { scriptsByDay: fetchedScriptsByDay } = useListCalendarScripts({
        projectUuid,
        year: currentYear,
        month: currentMonth + 1,
    });

    const { updateScript } = useUpdateScript();
    const { createScript } = useCreateScript();

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    const scriptsByDay = useMemo(() => {
        const map = new Map<string, Script[]>();
        for (const group of fetchedScriptsByDay) {
            map.set(group.date, group.scripts);
        }
        return map;
    }, [fetchedScriptsByDay]);

    const handleDragStart = (event: DragStartEvent) => {
        for (const group of fetchedScriptsByDay) {
            const script = group.scripts.find((s) => s.uuid === event.active.id);
            if (script) {
                setDraggedScript(script);
                return;
            }
        }
        setDraggedScript(null);
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

    const handleCreateScript = (date: Date) => {
        createScript({ projectUuid, title: "Nouveau script", publishedAt: date.toLocaleDateString("sv-SE") });
    };

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const handleToday = () => {
        setCurrentMonth(today.getMonth());
        setCurrentYear(today.getFullYear());
    };

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

    // Build grid: null for empty leading cells, then day numbers
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();

    return (
        <div className="flex flex-col w-full">
            {/* Header */}
            <div className="flex flex-row items-center justify-between px-2 pb-4">
                <div className="flex flex-row items-center gap-3">
                    <h2 className="text-heading-md">
                        {MONTHS_FR[currentMonth]} {currentYear}
                    </h2>
                    {!isCurrentMonth && (
                        <button
                            onClick={handleToday}
                            className="text-heading-xs text-primary hover:text-primary/80 transition-colors cursor-pointer"
                        >
                            Aujourd'hui
                        </button>
                    )}
                </div>

                <div className="flex flex-row items-center gap-1">
                    <button
                        onClick={handlePrevMonth}
                        className="p-1.5 hover:bg-light-gray rounded-md transition-colors cursor-pointer"
                    >
                        <ChevronLeftIcon className="size-4 text-gray" />
                    </button>
                    <button
                        onClick={handleNextMonth}
                        className="p-1.5 hover:bg-light-gray rounded-md transition-colors cursor-pointer"
                    >
                        <ChevronRightIcon className="size-4 text-gray" />
                    </button>
                </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 border-t border-l border-light-gray">
                {DAYS_FR.map((dayName) => (
                    <div key={dayName} className="text-center text-heading-xs text-gray py-2 border-b border-r border-light-gray">
                        {dayName}
                    </div>
                ))}
            </div>

            {/* Day grid */}
            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-7 border-l border-light-gray">
                    {days.map((day, index) => {
                        if (day === null) {
                            return <div key={`empty-${index}`} className="min-h-25 border-b border-r border-light-gray" />;
                        }

                        const date = new Date(currentYear, currentMonth, day);
                        const dateKey = toDateKey(date);
                        const dayScripts = scriptsByDay.get(dateKey) ?? [];

                        return (
                            <ScriptCalendarDayCell
                                key={day}
                                droppableId={`day-${day}`}
                                day={day}
                                isToday={isSameDay(date, today)}
                                scripts={dayScripts}
                                onScriptClick={setSelectedScript}
                                onCreateScript={() => handleCreateScript(date)}
                            />
                        );
                    })}
                </div>

                <DragOverlay dropAnimation={null}>
                    {draggedScript && (
                        <div className="opacity-90 rotate-1 shadow-lg">
                            <ScriptCalendarCard script={draggedScript} onClick={() => {}} />
                        </div>
                    )}
                </DragOverlay>
            </DndContext>

            <ScriptDetailModal
                script={selectedScript}
                projectUuid={projectUuid}
                onClose={() => setSelectedScript(null)}
            />
        </div>
    );
}
