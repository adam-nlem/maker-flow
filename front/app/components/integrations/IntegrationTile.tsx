import { useShowIntegrationProviderIcon } from "~/hooks/api/integrations/useShowIntegrationProviderIcon";
import { integrationProviderToFrenchTranslation } from "~/models/enums/IntegrationProvider";
import type { Integration } from "~/models/Integration";

interface IntegrationTileProps {
    integration: Integration;
    isSelected?: boolean;
    onClick?: () => void;
}

export default function IntegrationTile({ integration, isSelected = false, onClick }: IntegrationTileProps) {

    const { iconUrl } = useShowIntegrationProviderIcon(integration.provider)

    return (
        <div className={`flex flex-row justify-between gap-2 items-center ${isSelected ? 'bg-light-gray' : 'hover:bg-light-gray'} cursor-pointer rounded-md p-2 w-fit`}
            onClick={onClick}>
            {iconUrl && (
                <img
                    src={iconUrl}
                    alt={integration.provider}
                    className="size-5 rounded-md object-cover"
                />
            )}

            <h1 className={`text-heading-sm whitespace-nowrap ${isSelected ? 'text-dark' : 'text-gray'}`}>{integrationProviderToFrenchTranslation[integration.provider]}</h1>
        </div>
    )

}