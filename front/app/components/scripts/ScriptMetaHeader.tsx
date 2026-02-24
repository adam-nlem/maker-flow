import { useState } from "react";
import { CalendarDaysIcon, ChevronDownIcon, ChevronUpIcon, SwatchIcon } from "@heroicons/react/24/outline";
import type { Script } from "~/models/Script";
import { ScriptStatus, scriptStatusToLabel, scriptStatusToBgClass, scriptStatusToTextClass, scriptStatusToIcon } from "~/models/enums/ScriptStatus";
import { Input } from "~/components/ui/Input";
import Pill from "~/components/ui/Pill";
import { DatePicker } from "~/components/ui/DatePicker";
import SelectDropdown from "~/components/ui/SelectDropdown";
import ScriptTagsRow from "./ScriptTagsRow";
import ScriptPlatformsRow from "./ScriptPlatformsRow";
import ScriptSimpleMetaColumn from "./ScriptSimpleMetaCol";
import { useUpdateScript } from "~/hooks/api/scripts/useUpdateScript";
import { useScriptEditorStore } from "~/stores/scripts/scriptEditorStore";

interface ScriptMetaHeaderProps {
    script: Script;
    projectUuid: string;
}

export default function ScriptMetaHeader({ script, projectUuid }: ScriptMetaHeaderProps) {
    const [title, setTitle] = useState(script.title);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [status, setStatus] = useState<ScriptStatus | undefined>(script.status);

    const { updateScript } = useUpdateScript();
    const { isExpanded, toggle } = useScriptEditorStore();

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

    return (
        <div className="px-6 py-5 border-b border-light-gray flex flex-col gap-4">
            <div className="flex flex-row items-center gap-2">
                <Input
                    simple
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleTitleBlur}
                    placeholder="Titre du script"
                    textStyle="text-heading-xl"
                    fullWidth
                />
                <button onClick={toggle} className="shrink-0 text-gray hover:text-dark transition-colors cursor-pointer">
                    {isExpanded
                        ? <ChevronUpIcon className="size-5" strokeWidth={2} />
                        : <ChevronDownIcon className="size-5" strokeWidth={2} />
                    }
                </button>
            </div>

            {isExpanded ? (
                <div key="expanded" className="flex flex-col gap-4 animate-fade-in">
                    <ScriptPlatformsRow script={script} />

                    <ScriptTagsRow script={script} projectUuid={projectUuid} />

                    <SelectDropdown
                        items={Object.values(ScriptStatus)}
                        selectedItemId={status}
                        getItemId={(s) => s}
                        onSelect={handleStatusChange}
                        renderTrigger={({ onClick }) => (
                            <Pill
                                onClick={onClick}
                                icon={status ? scriptStatusToIcon[status] : SwatchIcon}
                                label={status ? scriptStatusToLabel[status] : "Statut"}
                                isSelected={!!status}
                                bgColorClassName={status ? scriptStatusToBgClass[status] : ""}
                                textColorClassName={status ? scriptStatusToTextClass[status] : ""} />)
                        }
                        renderItem={({ item, isSelected, onSelect }) => {
                            return !isSelected ? <Pill
                                label={scriptStatusToLabel[item]}
                                icon={scriptStatusToIcon[item]}
                                isSelected
                                onClick={onSelect}
                                bgColorClassName={scriptStatusToBgClass[item]}
                                textColorClassName={scriptStatusToTextClass[item]}
                            /> : null
                        }}
                    />

                    <div className="relative shrink-0">
                        <Pill
                            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                            icon={CalendarDaysIcon}
                            label={script.publishedAt
                                ? script.publishedAt.toLocaleDateString("fr-FR",
                                    {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric"
                                    }
                                )
                                : "Pas de date"}
                            isSelected={!!script.publishedAt} />

                        {isDatePickerOpen && (
                            <>
                                <div className="fixed inset-0 z-20" onClick={() => setIsDatePickerOpen(false)} />
                                <div className="absolute top-full left-0 mt-2 z-30">
                                    <DatePicker
                                        selectedDate={script.publishedAt ?? undefined}
                                        onDateSelected={handleDateSelected}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            ) : (
                <div key="collapsed" className="animate-fade-in">
                    <ScriptSimpleMetaColumn script={script} />
                </div>
            )}
        </div>
    );
}
