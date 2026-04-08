import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import { useIsDesktop } from "~/hooks/useIsDesktop";
import type { Script } from "~/models/Script";
import { useCreateScript } from "~/hooks/api/scripts/useCreateScript";
import { useFilteredCalendarScripts } from "~/hooks/useFilteredCalendarScripts";
import { useCalendarStore } from "~/stores/scripts/calendarStore";
import { DAYS_FR, MONTHS_FR, buildMonthGridDays, isSameDay, toDateKey } from "~/utils/dateHelpers";
import ScriptCalendarDayCell from "./ScriptCalendarDayCell";
import MobileCalendarGrid from "./MobileCalendarGrid";
import MobileDayDetail from "./MobileDayDetail";
import ScriptDetailModal from "../ScriptDetailModal";
import Pill from "~/components/ui/Pill";



interface ScriptCalendarProps {
    projectUuid: string;
}

export default function ScriptCalendar({ projectUuid }: ScriptCalendarProps) {
    const today = new Date();
    const { currentMonth, currentYear, selectedDay, setSelectedDay, goToPrevMonth, goToNextMonth, goToToday } = useCalendarStore();
    const [selectedScript, setSelectedScript] = useState<Script | null>(null);

    const { scriptsByDay } = useFilteredCalendarScripts({ projectUuid });
    const { createScript } = useCreateScript();
    const isDesktop = useIsDesktop();

    const handleCreateScript = (date: Date) => {
        createScript({ projectUuid, title: "Nouveau script", publishedAt: date.toLocaleDateString("sv-SE") });
    };

    const days = buildMonthGridDays(currentYear, currentMonth);
    const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();

    // Mobile: compute effective selected day
    const effectiveSelectedDay = selectedDay ?? (isCurrentMonth ? today.getDate() : 1);
    const selectedDate = new Date(currentYear, currentMonth, effectiveSelectedDay);
    const selectedDateKey = toDateKey(selectedDate);
    const selectedDayScripts = scriptsByDay.get(selectedDateKey) ?? [];

    return (
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* Header */}
            <div className="flex flex-row items-center justify-between px-2 pb-4">
                <h2 className="text-heading-md">
                    {MONTHS_FR[currentMonth]} {currentYear}
                </h2>

                <div className="flex flex-row items-center gap-1">
                    <button
                        onClick={goToPrevMonth}
                        className="p-1.5 hover:bg-light-gray rounded-md transition-colors cursor-pointer"
                    >
                        <ChevronLeftIcon className="size-5 text-gray" />
                    </button>
                    <Pill label="Aujourd'hui" isSelected={isCurrentMonth} onClick={goToToday} textColorClassName="text-primary" bgColorClassName="bg-primary/10" borderColorClassName="border border-primary/30" />
                    <button
                        onClick={goToNextMonth}
                        className="p-1.5 hover:bg-light-gray rounded-md transition-colors cursor-pointer"
                    >
                        <ChevronRightIcon className="size-5 text-gray" />
                    </button>
                </div>
            </div>

            {!isDesktop ? (
                <div className="flex flex-col gap-3 flex-1 min-h-0">
                    <MobileCalendarGrid
                        currentYear={currentYear}
                        currentMonth={currentMonth}
                        selectedDay={effectiveSelectedDay}
                        onDaySelect={setSelectedDay}
                        scriptsByDay={scriptsByDay}
                    />
                    <MobileDayDetail
                        day={effectiveSelectedDay}
                        date={selectedDate}
                        isToday={isSameDay(selectedDate, today)}
                        scripts={selectedDayScripts}
                        onScriptClick={setSelectedScript}
                        onCreateScript={() => handleCreateScript(selectedDate)}
                    />
                </div>
            ) : (
                <div className="flex flex-col flex-1 min-h-0">
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
                </div>
            )}

            <ScriptDetailModal
                script={selectedScript}
                projectUuid={projectUuid}
                onClose={() => setSelectedScript(null)}
            />
        </div>
    );
}
