import type { Script } from "~/models/Script";
import { DAYS_FR_SHORT, buildMonthGridDays, isSameDay, toDateKey } from "~/utils/dateHelpers";
import MobileCalendarDayCell from "./MobileCalendarDayCell";

interface MobileCalendarGridProps {
    currentYear: number;
    currentMonth: number;
    selectedDay: number;
    onDaySelect: (day: number) => void;
    scriptsByDay: Map<string, Script[]>;
}

export default function MobileCalendarGrid({ currentYear, currentMonth, selectedDay, onDaySelect, scriptsByDay }: MobileCalendarGridProps) {
    const today = new Date();
    const days = buildMonthGridDays(currentYear, currentMonth);

    return (
        <div className="flex flex-col gap-1">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-0.5">
                {DAYS_FR_SHORT.map((dayName, i) => (
                    <div key={i} className="text-center text-body-xs text-gray py-1">
                        {dayName}
                    </div>
                ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-0.5">
                {days.map((day, index) => {
                    if (day === null) {
                        return <div key={`empty-${index}`} />;
                    }

                    const date = new Date(currentYear, currentMonth, day);
                    const dateKey = toDateKey(date);
                    const scriptCount = scriptsByDay.get(dateKey)?.length ?? 0;

                    return (
                        <MobileCalendarDayCell
                            key={day}
                            day={day}
                            isToday={isSameDay(date, today)}
                            isSelected={day === selectedDay}
                            scriptCount={scriptCount}
                            onSelect={() => onDaySelect(day)}
                        />
                    );
                })}
            </div>
        </div>
    );
}
