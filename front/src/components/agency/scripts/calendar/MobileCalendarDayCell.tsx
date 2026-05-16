import { useDroppable } from "@dnd-kit/core";

interface MobileCalendarDayCellProps {
    day: number;
    isToday: boolean;
    isSelected: boolean;
    scriptCount: number;
    onSelect: () => void;
}

export default function MobileCalendarDayCell({ day, isToday, isSelected, scriptCount, onSelect }: MobileCalendarDayCellProps) {
    const { setNodeRef, isOver } = useDroppable({ id: `day-${day}` });

    const dots = Math.min(scriptCount, 3);

    return (
        <button
            ref={setNodeRef}
            onClick={onSelect}
            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-xl cursor-pointer transition-colors
                ${isSelected ? "bg-primary/10 border border-primary/30 text-primary" : ""}
                ${isToday && !isSelected ? "text-primary font-semibold" : ""}
                ${!isSelected && !isToday ? "text-dark" : ""}
                ${isOver ? "bg-primary/10" : ""}
            `}
        >
            <span className="text-heading-xs">{day}</span>
            {dots > 0 && (
                <div className="flex flex-row gap-0.5">
                    {Array.from({ length: dots }).map((_, i) => (
                        <div key={i} className={"size-1 rounded-full bg-primary"} />
                    ))}
                </div>
            )}
        </button>
    );
}
