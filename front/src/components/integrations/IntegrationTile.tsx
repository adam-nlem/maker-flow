import { useTranslation } from "react-i18next";
import type { Platform } from "~/models/enums/Platform";
import { platformTranslationKeys, platformToIcon } from "~/models/enums/Platform";
import { IntegrationStatus, integrationStatusToBorderClass, integrationStatusToBgClass } from "~/models/enums/IntegrationStatus";

interface IntegrationTileProps {
    platform: Platform;
    status: IntegrationStatus | undefined;
    onClick: () => void;
    compact?: boolean;
}

export default function IntegrationTile({ platform, status = IntegrationStatus.Revoked, onClick, compact = false }: IntegrationTileProps) {
    const { t } = useTranslation();
    const label = t(platformTranslationKeys[platform]);

    if (compact) {
        return (
            <button
                type="button"
                onClick={onClick}
                aria-label={label}
                className="relative group size-9 flex items-center justify-center rounded-lg cursor-pointer hover:bg-surface-hover"
            >
                <img src={platformToIcon[platform]} className="size-4 shrink-0" alt="" />
                <span className={`absolute bottom-1 right-1 size-2 rounded-full ${integrationStatusToBgClass[status]} ${integrationStatusToBorderClass[status]}`} />
                <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-dark text-clear text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {label}
                </span>
            </button>
        );
    }

    return (
        <div
            className="flex flex-row items-center gap-3 cursor-pointer rounded-lg p-2 hover:bg-surface-hover border border-transparent"
            onClick={onClick}
        >
            <img src={platformToIcon[platform]} className="size-4 shrink-0" alt={label} />
            <span className="text-body-xs whitespace-nowrap">
                {label}
            </span>
            <span className={`size-2 rounded-full ml-auto shrink-0 ${integrationStatusToBgClass[status]} ${integrationStatusToBorderClass[status]}`} />
        </div>
    );
}
