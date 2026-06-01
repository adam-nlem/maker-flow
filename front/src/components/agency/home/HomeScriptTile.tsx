import type { Script } from "~/models/Script";
import { useTranslation } from "react-i18next";
import Pill from "~/components/ui/Pill";
import {
    ScriptStatus,
    scriptStatusToBgClass,
    scriptStatusToBorderClass,
    scriptStatusTranslationKeys,
    scriptStatusToIcon,
    scriptStatusToTextClass,
} from "~/models/enums/ScriptStatus";
import { formatToRelative } from "~/utils/dateFormatters";

interface HomeScriptTileProps {
    script: Script;
    onClick: () => void;
}

export default function HomeScriptTile({ script, onClick }: HomeScriptTileProps) {
    const { t } = useTranslation();
    const status = script.status ?? ScriptStatus.Idea;
    const Icon = scriptStatusToIcon[status];
    const statusLabel = t(scriptStatusTranslationKeys[status]);

    return (
        <div
            onClick={onClick}
            className="flex flex-row items-center gap-2 rounded-lg px-3 py-2 hover:bg-surface-hover transition-colors text-left cursor-pointer"
        >
            <div className={`size-8 shrink-0 rounded-md flex items-center justify-center ${scriptStatusToBgClass[status]}`}>
                <Icon className={`size-4 ${scriptStatusToTextClass[status]}`} strokeWidth={2} />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
                <p className="text-heading-sm truncate">{script.title}</p>
                <p className="text-body-xs text-muted-2 truncate">{statusLabel} {script.updatedAt && `· ${t("home:scripts.modifiedRelative", { when: formatToRelative(script.updatedAt) })}`}</p>
            </div>
            <Pill
                label={statusLabel}
                isSelected
                bgColorClassName={scriptStatusToBgClass[status]}
                borderColorClassName={scriptStatusToBorderClass[status]}
                textColorClassName={scriptStatusToTextClass[status]}
            />
        </div>
    );
}
