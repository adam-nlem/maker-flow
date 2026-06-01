import { useState } from "react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { ModalAlign } from "~/models/enums/ModalAlign";
import type { Script } from "~/models/Script";
import {
    scriptStatusToBgClass,
    scriptStatusToBorderClass,
    scriptStatusToTextClass,
    scriptStatusToIcon,
    scriptStatusTranslationKeys,
} from "~/models/enums/ScriptStatus";
import ScriptPickerModal from "./ScriptPickerModal";

interface LinkedScriptFieldProps {
    projectUuid: string;
    value: Script | null;
    onChange: (script: Script | null) => void;
    pickerAlign?: ModalAlign;
    onPickerOpenChange?: (isOpen: boolean) => void;
}

export default function LinkedScriptField({ projectUuid, value, onChange, pickerAlign = ModalAlign.Center, onPickerOpenChange }: LinkedScriptFieldProps) {
    const { t } = useTranslation();
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const setPickerOpen = (open: boolean) => {
        setIsPickerOpen(open);
        onPickerOpenChange?.(open);
    };

    const status = value?.status;
    const StatusIcon = status ? scriptStatusToIcon[status] : null;

    return (
        <>
            {value ? (
                <div className="flex flex-row items-center gap-2 rounded-lg border border-pale-gray-2 bg-clear px-3 py-1.5">
                    <p className="flex-1 min-w-0 truncate text-body-sm text-dark">{value.title}</p>

                    {status && StatusIcon && (
                        <span
                            className={`inline-flex items-center gap-1 shrink-0 rounded-full px-2 py-0.5 text-body-xs ${scriptStatusToBgClass[status]} ${scriptStatusToBorderClass[status]} ${scriptStatusToTextClass[status]}`}
                        >
                            <StatusIcon className="size-3.5" strokeWidth={2} />
                            {t(scriptStatusTranslationKeys[status])}
                        </span>
                    )}

                    <button
                        type="button"
                        onClick={() => setPickerOpen(true)}
                        className="shrink-0 text-body-xs text-muted hover:text-dark transition-colors cursor-pointer"
                    >
                        {t("scripts:picker.linkedField.changeAction")}
                    </button>

                    <button
                        type="button"
                        onClick={() => onChange(null)}
                        aria-label={t("scripts:picker.linkedField.unlinkAction")}
                        className="shrink-0 text-muted-2 hover:text-danger transition-colors cursor-pointer"
                    >
                        <XMarkIcon className="size-4" strokeWidth={2} />
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className="flex flex-row items-center justify-center gap-1.5 w-full rounded-lg border border-dashed border-pale-gray-2 bg-clear px-3 py-1.5 text-body-sm text-muted hover:text-dark hover:bg-clear-2 transition-colors cursor-pointer"
                >
                    <PlusIcon className="size-4" strokeWidth={2} />
                    {t("scripts:picker.linkedField.linkAction")}
                </button>
            )}

            <ScriptPickerModal
                isOpen={isPickerOpen}
                onClose={() => setPickerOpen(false)}
                onConfirm={(script) => onChange(script)}
                projectUuid={projectUuid}
                initialSelectedUuid={value?.uuid ?? null}
                align={pickerAlign}
                nested={pickerAlign !== ModalAlign.Center}
            />
        </>
    );
}
