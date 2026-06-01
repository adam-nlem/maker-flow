import { useTranslation } from "react-i18next";
import type { Script } from "~/models/Script";
import {
    scriptStatusToBgClass,
    scriptStatusToBorderClass,
    scriptStatusToTextClass,
    scriptStatusToIcon,
    scriptStatusTranslationKeys,
} from "~/models/enums/ScriptStatus";

interface ScriptPickerItemProps {
    script: Script;
    isSelected: boolean;
    onClick: () => void;
}

export default function ScriptPickerItem({ script, isSelected, onClick }: ScriptPickerItemProps) {
    const { t } = useTranslation();
    const status = script.status;
    const StatusIcon = status ? scriptStatusToIcon[status] : null;

    return (
        <div
            onClick={onClick}
            className={`flex flex-row items-center gap-3 p-3 rounded-md text-left cursor-pointer transition-colors border ${
                isSelected
                    ? "bg-primary/10 border-primary/30"
                    : "bg-clear border-pale-gray hover:bg-clear-2"
            }`}
        >
            <p className={`flex-1 min-w-0 truncate text-body-sm ${isSelected ? "text-primary" : "text-dark"}`}>
                {script.title}
            </p>

            {status && StatusIcon && (
                <span
                    className={`inline-flex items-center gap-1 shrink-0 rounded-full px-2 py-0.5 text-body-xs ${scriptStatusToBgClass[status]} ${scriptStatusToBorderClass[status]} ${scriptStatusToTextClass[status]}`}
                >
                    <StatusIcon className="size-3.5" strokeWidth={2} />
                    {t(scriptStatusTranslationKeys[status])}
                </span>
            )}
        </div>
    );
}
