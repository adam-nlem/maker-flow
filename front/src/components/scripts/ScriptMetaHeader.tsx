import { useState } from "react";
import { ArrowLeftIcon, CalendarDaysIcon, ChevronDownIcon, ChevronUpIcon, PencilSquareIcon, SparklesIcon, SwatchIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useIsDesktop } from "~/hooks/useIsDesktop";
import type { Script } from "~/models/Script";
import { type ScriptStatus, scriptStatusOptions, scriptStatusToFrenchTranslation, scriptStatusToBgClass, scriptStatusToBorderClass, scriptStatusToTextClass, scriptStatusToIcon } from "~/models/enums/ScriptStatus";
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
    onOpenGenerateModal: () => void;
    isReadOnly?: boolean;
    hidePanelTriggers?: boolean;
    onOpenEditor?: () => void;
    onBack?: () => void;
}

export default function ScriptMetaHeader({ script, projectUuid, onOpenGenerateModal, isReadOnly, hidePanelTriggers, onOpenEditor, onBack }: ScriptMetaHeaderProps) {
    const [title, setTitle] = useState(script.title);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [status, setStatus] = useState<ScriptStatus | undefined>(script.status);

    const { updateScript } = useUpdateScript();
    const { isExpanded, toggle } = useScriptEditorStore();
    const isDesktop = useIsDesktop();

    const handleTitleBlur = () => {
        if (isReadOnly) return;
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
                {onBack && !isDesktop && (
                    <button onClick={onBack} className="shrink-0 text-gray hover:text-dark transition-colors cursor-pointer">
                        <ArrowLeftIcon className="size-5" strokeWidth={2} />
                    </button>
                )}
                <Input
                    simple
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleTitleBlur}
                    readOnly={isReadOnly}
                    placeholder="Titre du script"
                    textStyle="text-heading-xl"
                />
                {isReadOnly && onOpenEditor ? (
                     <Pill
                        icon={PencilSquareIcon}
                        label="Modifier"
                        isSelected
                        onClick={onOpenEditor}
                        textColorClassName="text-primary"
                        bgColorClassName="bg-primary/10"
                        borderColorClassName="border border-primary/30"
                    />
                ) : !isReadOnly && !hidePanelTriggers ? (
                    <button onClick={onOpenGenerateModal} className="shrink-0 text-primary hover:text-primary-200 transition-colors cursor-pointer" title="Générer avec l'IA">
                        <SparklesIcon className="size-5" strokeWidth={2} />
                    </button>
                ) : null}
                <button onClick={toggle} className="shrink-0 text-gray hover:text-dark transition-colors cursor-pointer">
                    {isExpanded
                        ? <ChevronUpIcon className="size-5" strokeWidth={2} />
                        : <ChevronDownIcon className="size-5" strokeWidth={2} />
                    }
                </button>
            </div>

            {isExpanded ? (
                <div key="expanded" className="flex flex-col gap-4 animate-fade-in">
                    <ScriptPlatformsRow script={script} isReadOnly={isReadOnly} />

                    <ScriptTagsRow script={script} projectUuid={projectUuid} isReadOnly={isReadOnly} />

                    {isReadOnly ? (
                        <Pill
                            icon={status ? scriptStatusToIcon[status] : SwatchIcon}
                            label={status ? scriptStatusToFrenchTranslation[status] : "Statut"}
                            isSelected={!!status}
                            bgColorClassName={status ? scriptStatusToBgClass[status] : ""}
                            borderColorClassName={status ? scriptStatusToBorderClass[status] : ""}
                            textColorClassName={status ? scriptStatusToTextClass[status] : ""}
                        />
                    ) : (
                        <SelectDropdown
                            items={scriptStatusOptions}
                            selectedItemId={status}
                            getItemId={(s) => s}
                            onSelect={handleStatusChange}
                            renderTrigger={({ onClick }) => (
                                <Pill
                                    onClick={onClick}
                                    icon={status ? scriptStatusToIcon[status] : SwatchIcon}
                                    label={status ? scriptStatusToFrenchTranslation[status] : "Statut"}
                                    isSelected={!!status}
                                    bgColorClassName={status ? scriptStatusToBgClass[status] : ""}
                                    borderColorClassName={status ? scriptStatusToBorderClass[status] : ""}
                                    textColorClassName={status ? scriptStatusToTextClass[status] : ""} />)
                            }
                            renderItem={({ item, isSelected, onSelect }) => {
                                return !isSelected ? <Pill
                                    label={scriptStatusToFrenchTranslation[item]}
                                    icon={scriptStatusToIcon[item]}
                                    isSelected
                                    onClick={onSelect}
                                    bgColorClassName={scriptStatusToBgClass[item]}
                                    borderColorClassName={scriptStatusToBorderClass[item]}
                                    textColorClassName={scriptStatusToTextClass[item]}
                                /> : null
                            }}
                        />
                    )}

                    <div className="relative shrink-0">
                        <Pill
                            onClick={isReadOnly ? undefined : () => setIsDatePickerOpen(!isDatePickerOpen)}
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
                            isSelected={!!script.publishedAt}
                            borderColorClassName="border-light-gray"
                            suffixIcon={!isReadOnly && script.publishedAt ? XMarkIcon : undefined}
                            onSuffixClick={() => {
                                updateScript({ scriptUuid: script.uuid, data: { publishedAt: null } });
                                setIsDatePickerOpen(false);
                            }} />

                        {!isReadOnly && isDatePickerOpen && (
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
