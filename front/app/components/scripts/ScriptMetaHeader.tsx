import { useState } from "react";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import type { Script } from "~/models/Script";
import { Input } from "~/components/ui/Input";
import { DatePicker } from "~/components/ui/DatePicker";
import ScriptTagsRow from "./ScriptTagsRow";
import { useUpdateScript } from "~/hooks/api/scripts/useUpdateScript";

interface ScriptMetaHeaderProps {
    script: Script;
    projectUuid: string;
}

export default function ScriptMetaHeader({ script, projectUuid }: ScriptMetaHeaderProps) {
    const [title, setTitle] = useState(script.title);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

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

    const publishedAtLabel = script.publishedAt
        ? script.publishedAt.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
        : "Pas de date";

    return (
        <div className="px-6 py-5 border-b border-light-gray flex flex-col gap-4">
            {/* Title */}
            <Input
                simple
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                placeholder="Titre du script"
                textStyle="text-heading-xl"
                fullWidth
            />

            {/* Bottom row: tags + publication date */}
            <div className="flex flex-row items-center gap-4 flex-wrap">
                <ScriptTagsRow script={script} projectUuid={projectUuid} />

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
