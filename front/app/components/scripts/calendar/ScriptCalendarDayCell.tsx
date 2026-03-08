import { useDroppable } from "@dnd-kit/core";
import { PlusIcon } from "@heroicons/react/24/outline";
import type { Script } from "~/models/Script";
import ScriptCalendarTile from "./ScriptCalendarTile";

interface ScriptCalendarDayCellProps {
    droppableId: string;
    day: number;
    isToday: boolean;
    scripts: Script[];
    onScriptClick: (script: Script) => void;
    onCreateScript: () => void;
}

export default function ScriptCalendarDayCell({ droppableId, day, isToday, scripts, onScriptClick, onCreateScript }: ScriptCalendarDayCellProps) {
    const { setNodeRef, isOver } = useDroppable({ id: droppableId });

    return (
        <div ref={setNodeRef} className={`group relative flex flex-col border-b border-r border-light-gray p-1.5 transition-colors overflow-hidden ${isOver ? "bg-primary/5" : ""}`}>
            <div className="flex flex-row items-center justify-between mb-1">
                {isToday ? (
                    <span className="flex items-center justify-center size-6 rounded-full bg-primary text-clear text-heading-xs">
                        {day}
                    </span>
                ) : (
                    <span className="text-heading-xs text-gray px-1">{day}</span>
                )}

                <button
                    onClick={onCreateScript}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray hover:text-primary cursor-pointer"
                >
                    <PlusIcon className="size-3.5" strokeWidth={2} />
                </button>
            </div>

            <div className="flex flex-col gap-0.5 overflow-y-auto scrollbar-none flex-1 min-h-0">
                {scripts.map((script) => (
                    <ScriptCalendarTile
                        key={script.uuid}
                        script={script}
                        onClick={() => onScriptClick(script)}
                    />
                ))}
            </div>
        </div>
    );
}
