import { useMemo, useState } from "react";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import type { Script } from "~/models/Script";
import { platformOptions } from "~/models/enums/Platform";
import { scriptStatusOptions } from "~/models/enums/ScriptStatus";
import { useCreateScript } from "~/hooks/api/scripts/useCreateScript";
import { useListCalendarScripts } from "~/hooks/api/scripts/useListCalendarScripts";
import { useListScriptTags } from "~/hooks/api/scriptTags/useListScriptTags";
import { useCalendarStore } from "~/stores/scripts/calendarStore";
import { DAYS_FR, MONTHS_FR, getDaysInMonth, getFirstDayOfMonth, isSameDay, toDateKey } from "~/utils/dateHelpers";
import ScriptCalendarDayCell from "./ScriptCalendarDayCell";
import ScriptDetailModal from "../ScriptDetailModal";
import Pill from "~/components/ui/Pill";



interface ScriptCalendarProps {
    projectUuid: string;
}

export default function ScriptCalendar({ projectUuid }: ScriptCalendarProps) {
    const today = new Date();
    const { currentMonth, currentYear, setCurrentMonth, setCurrentYear, selectedPlatforms, selectedStatuses, selectedTagUuids } = useCalendarStore();
    const [selectedScript, setSelectedScript] = useState<Script | null>(null);

    const { scriptTags } = useListScriptTags({ projectUuid });

    const { scriptsByDay: fetchedScriptsByDay } = useListCalendarScripts({
        projectUuid,
        year: currentYear,
        month: currentMonth + 1,
    });

    const noPlatformFilter = selectedPlatforms.length === 0 || selectedPlatforms.length === platformOptions.length;
    const noStatusFilter = selectedStatuses.length === 0 || selectedStatuses.length === scriptStatusOptions.length;
    const noTagFilter = selectedTagUuids.length === 0 || (scriptTags.length > 0 && selectedTagUuids.length === scriptTags.length);

    const filteredScriptsByDay = useMemo(() => {
        if (noPlatformFilter && noStatusFilter && noTagFilter) return fetchedScriptsByDay;

        return fetchedScriptsByDay
            .map((group) => ({
                ...group,
                scripts: group.scripts.filter((script) => {
                    if (!noPlatformFilter && !script.platforms.some((p) => selectedPlatforms.includes(p))) return false;
                    if (!noStatusFilter && (!script.status || !selectedStatuses.includes(script.status))) return false;
                    if (!noTagFilter && !script.tags.some((t) => selectedTagUuids.includes(t.uuid))) return false;
                    return true;
                }),
            }))
            .filter((group) => group.scripts.length > 0);
    }, [fetchedScriptsByDay, selectedPlatforms, selectedStatuses, selectedTagUuids, noPlatformFilter, noStatusFilter, noTagFilter]);

    const { createScript } = useCreateScript();

    const scriptsByDay = useMemo(() => {
        const map = new Map<string, Script[]>();
        for (const group of filteredScriptsByDay) {
            map.set(group.date, group.scripts);
        }
        return map;
    }, [filteredScriptsByDay]);

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
        <div className="flex flex-col flex-1 min-h-[calc(100vh-12.5rem)] overflow-hidden">
            {/* Header */}
            <div className="flex flex-row items-center justify-between px-2 pb-4">
                <h2 className="text-heading-md">
                    {MONTHS_FR[currentMonth]} {currentYear}
                </h2>

                <div className="flex flex-row items-center gap-1">
                    <button
                        onClick={handlePrevMonth}
                        className="p-1.5 hover:bg-light-gray rounded-md transition-colors cursor-pointer"
                    >
                        <ChevronLeftIcon className="size-5 text-gray" />
                    </button>
                    <Pill label="Aujourd'hui" isSelected={isCurrentMonth} onClick={handleToday} textColorClassName="text-primary" bgColorClassName="bg-primary/10" borderColorClassName="border border-primary/30" />
                    <button
                        onClick={handleNextMonth}
                        className="p-1.5 hover:bg-light-gray rounded-md transition-colors cursor-pointer"
                    >
                        <ChevronRightIcon className="size-5 text-gray" />
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
            <div className="grid grid-cols-7 auto-rows-fr flex-1 min-h-0 border-l border-light-gray">
                {days.map((day, index) => {
                    if (day === null) {
                        return <div key={`empty-${index}`} className="border-b border-r border-light-gray" />;
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

            <ScriptDetailModal
                script={selectedScript}
                projectUuid={projectUuid}
                onClose={() => setSelectedScript(null)}
            />
        </div>
    );
}
