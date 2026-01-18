import type { Integration } from "~/models/Integration"
import { useShowIntegrationProviderIcon } from "~/hooks/api/integrations/useShowIntegrationProviderIcon"
import { SocialAnalyticsInsightType, socialAnalyticsInsightTypeToFrenchTranslation } from "../models/enums/SocialAnalyticsInsightType"
import type { SocialAnalyticsTimePeriod } from "../models/enums/SocialAnalyticsTimePeriod"
import { socialAnalyticsTimePeriodToFrenchTranslation } from "../models/enums/SocialAnalyticsTimePeriod"
import { useListSocialAnalyticsInsights } from "../hooks/api/socialAnalyticsInsight/useListSocialAnalyticsInsights"

interface IntegrationTileProps {
    integration: Integration
    insightType: SocialAnalyticsInsightType
    onClick?: () => void
}

export default function IntegrationTile({
    integration,
    insightType,
    onClick,
}: IntegrationTileProps) {
    const { iconUrl } = useShowIntegrationProviderIcon(integration.provider)
    const { socialAnalyticsInsights, isLoading, error } = useListSocialAnalyticsInsights({ integrationUuid: integration.uuid })

    return (
        <div
            className="border bg-clear border-light-gray rounded-lg p-2 flex flex-col gap-3 min-w-0 cursor-pointer"
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

                {iconUrl && (
                    <img
                        src={iconUrl}
                        alt={integration.displayName}
                        className="ml-20 size-7 rounded-md object-cover"
                    />
                )}
            </div>
            <div className="border-t border-light-gray rounded w-full"></div>

            <div>
                <h1 className="text-heading-sm">{socialAnalyticsInsights.map((insight) => insight.type === insightType ? insight.value : '')}</h1>
                <p className="text-body-sm text-gray whitespace-nowrap">
                    {socialAnalyticsInsightTypeToFrenchTranslation[insightType]}
                </p>
            </div>
        </div>
    )
}
