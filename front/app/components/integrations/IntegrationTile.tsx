import { useShowPlatformIcon } from "~/hooks/api/integrations/useShowPlatformIcon";
import { platformToFrenchTranslation } from "~/models/enums/Platform";
import type { Integration } from "~/models/Integration";

interface IntegrationTileProps {
    integration: Integration;
    isSelected?: boolean;
    onClick?: () => void;
}

export default function IntegrationTile({ integration, isSelected = false, onClick }: IntegrationTileProps) {

    const { iconUrl } = useShowPlatformIcon(integration.platform)

    return (
        <div className={`flex flex-row justify-between gap-2 items-center ${isSelected ? 'bg-light-gray' : 'hover:bg-light-gray'} cursor-pointer rounded-md p-2 w-fit`}
            onClick={onClick}>
            {iconUrl && (
                <img
                    src={iconUrl}
                    alt={integration.platform}
                    className="size-5 rounded-md object-cover"
                />
            )}

            <h1 className={`text-heading-sm whitespace-nowrap ${isSelected ? 'text-dark' : 'text-gray'}`}>{platformToFrenchTranslation[integration.platform]}</h1>
        </div>
    )

}
