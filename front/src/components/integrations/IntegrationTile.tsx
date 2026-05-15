import { useTranslation } from "react-i18next";
import type { Platform } from "~/models/enums/Platform";
import { platformTranslationKeys, platformToIcon } from "~/models/enums/Platform";
import { IntegrationStatus, integrationStatusToBorderClass, integrationStatusToBgClass } from "~/models/enums/IntegrationStatus";

interface IntegrationTileProps {
    platform: Platform;
    status: IntegrationStatus | undefined;
    onClick: () => void;
}

export default function IntegrationTile({ platform, status = IntegrationStatus.Revoked, onClick }: IntegrationTileProps) {
    const { t } = useTranslation();
    return (
        <div
            className="flex flex-row items-center gap-3 cursor-pointer rounded-lg p-2 hover:bg-surface-hover border border-transparent"
            onClick={onClick}
        >
            <img src={platformToIcon[platform]} className="size-4 shrink-0" alt={t(platformTranslationKeys[platform])} />
            <span className="text-body-xs whitespace-nowrap">
                {t(platformTranslationKeys[platform])}
            </span>
            <span className={`size-2 rounded-full ml-auto shrink-0 ${integrationStatusToBgClass[status]} ${integrationStatusToBorderClass[status]}`} />
        </div>
    );
}
