import { useDroppable } from "@dnd-kit/core";
import { PlusIcon } from "@heroicons/react/24/outline";
import type { Script } from "~/models/Script";
import ScriptTile from "~/components/scripts/ScriptTile";
import { DAYS_FR_FULL, getDayOfWeek, MONTHS_FR } from "~/utils/dateHelpers";

interface MobileDayDetailProps {
    day: number;
    date: Date;
    isToday: boolean;
    scripts: Script[];
    onScriptClick: (script: Script) => void;
    onCreateScript: () => void;
}

export default function MobileDayDetail({ day, date, isToday, scripts, onScriptClick, onCreateScript }: MobileDayDetailProps) {
    const { setNodeRef, isOver } = useDroppable({ id: `day-${day}` });

    const dayName = DAYS_FR_FULL[getDayOfWeek(date)];
    const monthName = MONTHS_FR[date.getMonth()];

    return (
        <div
            ref={setNodeRef}
            className={`flex flex-col flex-1 min-h-0 rounded-xl border border-light-gray p-3 transition-colors ${isOver ? "bg-primary/5" : ""}`}
        >
            {/* Header */}
            <div className="flex flex-row items-center justify-between mb-3">
                <div className="flex flex-row items-center gap-2">
                    <h3 className="text-heading-sm">
                        {dayName} {day} {monthName}
                    </h3>
                    {isToday && (
                        <span className="text-body-xs text-primary font-semibold">Aujourd'hui</span>
                    )}
                </div>

                <button
                    onClick={onCreateScript}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-gray hover:text-primary hover:bg-light-gray transition-colors cursor-pointer"
                >
                    <PlusIcon className="size-4" strokeWidth={2} />
                    <span className="text-body-xs">Nouveau</span>
                </button>
            </div>

            {/* Scripts list */}
            <div className="flex flex-col gap-1.5 overflow-y-auto scrollbar-none flex-1 min-h-0">
                {scripts.length === 0 ? (
                    <p className="text-body-sm text-gray text-center py-6">Aucun script</p>
                ) : (
                    scripts.map((script) => (
                        <ScriptTile
                            key={script.uuid}
                            script={script}
                            onClick={() => onScriptClick(script)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
