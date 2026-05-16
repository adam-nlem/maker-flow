import { useDroppable } from "@dnd-kit/core";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import type { Script } from "~/models/Script";
import ScriptTile from "~/components/agency/scripts/ScriptTile";
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
    const { t } = useTranslation();
    const { setNodeRef, isOver } = useDroppable({ id: `day-${day}` });

    const dayName = DAYS_FR_FULL[getDayOfWeek(date)];
    const monthName = MONTHS_FR[date.getMonth()];

    return (
        <div
            ref={setNodeRef}
            className={`flex flex-col flex-1 min-h-0 rounded-xl border border-pale-gray p-3 transition-colors ${isOver ? "bg-primary/5" : ""}`}
        >
            {/* Header */}
            <div className="flex flex-row items-center justify-between mb-3">
                <div className="flex flex-row items-center gap-2">
                    <h3 className="text-heading-sm">
                        {dayName} {day} {monthName}
                    </h3>
                    {isToday && (
                        <span className="text-body-xs text-primary font-semibold">{t("scripts:calendar.today")}</span>
                    )}
                </div>

                <button
                    onClick={onCreateScript}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-muted-2 hover:text-primary hover:bg-pale-gray-2 transition-colors cursor-pointer"
                >
                    <PlusIcon className="size-4" strokeWidth={2} />
                    <span className="text-body-xs">{t("home:scripts.newScript")}</span>
                </button>
            </div>

            {/* Scripts list */}
            <div className="flex flex-col gap-1.5 overflow-y-auto scrollbar-none flex-1 min-h-0">
                {scripts.length === 0 ? (
                    <p className="text-body-sm text-muted-2 text-center py-6">{t("scripts:noScripts")}</p>
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
