import { useState } from "react";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import type { Script } from "~/models/Script";
import { ScriptStatus, scriptStatusToLabel, scriptStatusToBgClass, scriptStatusToTextClass } from "~/models/enums/ScriptStatus";
import { Input } from "~/components/ui/Input";
import { Pill } from "~/components/ui/Pill";
import { DatePicker } from "~/components/ui/DatePicker";
import SelectDropdown from "~/components/ui/SelectDropdown";
import ScriptTagsRow from "./ScriptTagsRow";
import ScriptPlatformsRow from "./ScriptPlatformsRow";
import { useUpdateScript } from "~/hooks/api/scripts/useUpdateScript";

interface ScriptMetaHeaderProps {
    script: Script;
    projectUuid: string;
}

export default function ScriptMetaHeader({ script, projectUuid }: ScriptMetaHeaderProps) {
    const [title, setTitle] = useState(script.title);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [status, setStatus] = useState<ScriptStatus | undefined>(script.status);

    const { updateScript } = useUpdateScript();

    const handleTitleBlur = () => {
        if (title.trim() !== script.title) {
            updateScript({ scriptUuid: script.uuid, data: { title: title.trim() || script.title } });
        }
    };

    const handleDateSelected = (date: Date) => {
        updateScript({ scriptUuid: script.uuid, data: { publishedAt: date } });
        setIsDatePickerOpen(false);
    };

    const handleStatusChange = (newStatus: ScriptStatus) => {
        setStatus(newStatus);
        updateScript({ scriptUuid: script.uuid, data: { status: newStatus } });
    };

    const publishedAtLabel = script.publishedAt
        ? script.publishedAt.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
        : "Pas de date";

    const statusPillColor = status
        ? `${scriptStatusToBgClass[status]} ${scriptStatusToTextClass[status]}`
        : "bg-light-gray text-gray";

    return (
        <div className="px-6 py-5 border-b border-light-gray flex flex-col gap-4">
            {/* Title + platform icons */}

            <Input
                simple
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                placeholder="Titre du script"
                textStyle="text-heading-xl"
                fullWidth
            />
            <ScriptPlatformsRow script={script} />


            {/* Bottom row: tags + status + publication date */}
            <div className="flex flex-row items-center gap-4 flex-wrap">
                <ScriptTagsRow script={script} projectUuid={projectUuid} />

                <SelectDropdown
                    items={Object.values(ScriptStatus)}
                    selectedItemId={status}
                    getItemId={(s) => s}
                    onSelect={handleStatusChange}
                    renderTrigger={({ onClick }) => (
                        <button onClick={onClick} className="cursor-pointer">
                            <Pill text={status ? scriptStatusToLabel[status] : "Statut"} color={statusPillColor} />
                        </button>
                    )}
                    renderItem={({ item, isSelected, onSelect }) => (
                        <button onClick={onSelect} className="cursor-pointer">
                            <Pill
                                text={scriptStatusToLabel[item]}
                                color={`${scriptStatusToBgClass[item]} ${scriptStatusToTextClass[item]}${isSelected ? " ring-1 ring-current" : ""}`}
                            />
                        </button>
                    )}
                />

                <div className="relative ml-auto shrink-0">
                    <button
                        onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                        className="flex flex-row items-center gap-2 text-gray hover:text-dark transition-colors cursor-pointer"
                    >
                        <CalendarDaysIcon className="size-4 shrink-0" strokeWidth={2} />
                        <span className="text-body-sm">{publishedAtLabel}</span>
                    </button>

                    {isDatePickerOpen && (
                        <>
                            <div className="fixed inset-0 z-20" onClick={() => setIsDatePickerOpen(false)} />
                            <div className="absolute top-full right-0 mt-2 z-30">
                                <DatePicker
                                    selectedDate={script.publishedAt ?? undefined}
                                    onDateSelected={handleDateSelected}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
