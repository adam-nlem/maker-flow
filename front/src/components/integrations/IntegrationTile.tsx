import type { Platform } from "~/models/enums/Platform";
import { platformToFrenchTranslation, platformToIcon } from "~/models/enums/Platform";
import { IntegrationStatus, integrationStatusToBorderClass, integrationStatusToBgClass } from "~/models/enums/IntegrationStatus";

interface IntegrationTileProps {
    platform: Platform;
    status: IntegrationStatus | undefined;
    onClick: () => void;
}

export default function IntegrationTile({ platform, status = IntegrationStatus.Revoked, onClick }: IntegrationTileProps) {
    return (
        <div
            className="flex flex-row items-center gap-3 cursor-pointer rounded-lg p-2 hover:bg-surface-hover border border-transparent"
            onClick={onClick}
        >
            <img src={platformToIcon[platform]} className="size-5 shrink-0" alt={platformToFrenchTranslation[platform]} />
            <span className="text-body-sm whitespace-nowrap text-gray">
                {platformToFrenchTranslation[platform]}
            </span>
            <span className={`size-2 rounded-full ml-auto shrink-0 ${integrationStatusToBgClass[status]} ${integrationStatusToBorderClass[status]}`} />
        </div>
    );
}
