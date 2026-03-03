import type { Integration } from "~/models/Integration"
import { IntegrationInsightType, integrationInsightTypeToFrenchTranslation } from "~/models/enums/IntegrationInsightType"
import { useListIntegrationInsights } from "~/hooks/api/integrationInsights/useListIntegrationInsights"
import { platformToIcon, PLATFORM_PLACEHOLDER_ICON } from "~/models/enums/Platform"
import type { Platform } from "~/models/enums/Platform"

interface IntegrationCardProps {
    integration: Integration
    insightType: IntegrationInsightType
    onClick?: () => void
}

export default function IntegrationCard({
    integration,
    insightType,
    onClick,
}: IntegrationCardProps) {
    const { integrationInsights, isLoading, error } = useListIntegrationInsights({ integrationUuid: integration.uuid })

    return (
        <div
            className="border bg-clear border-light-gray rounded-lg p-2 flex flex-col gap-3 w-full cursor-pointer"
            onClick={onClick}
        >
            <div className="flex flex-row gap-10 justify-between">
                <div className="flex flex-row gap-1 items-center">
                    {integration.profilePictureUrl && (
                        <img
                            src={integration.profilePictureUrl}
                            alt={integration.displayName}
                            className="size-10 rounded-full object-cover"
                        />
                    )}
                    <div className="flex flex-col">
                        <h1 className="text-heading-sm">{integration.name}</h1>
                        <p className="text-body-sm text-gray">{integration.userName}</p>
                    </div>
                </div>

                <img
                    src={platformToIcon[integration.platform]}
                    alt={integration.platform}
                    className="ml-20 size-7 rounded-md object-cover"
                />
            </div>
            <div className="border-t border-light-gray rounded w-full"></div>

            <div>
                <h1 className="text-heading-sm">{integrationInsights.find((insight) => insight.type === insightType)?.value}</h1>
                <p className="text-body-sm text-gray whitespace-nowrap">
                    {integrationInsightTypeToFrenchTranslation[insightType]}
                </p>
            </div>
        </div>
    )
}
