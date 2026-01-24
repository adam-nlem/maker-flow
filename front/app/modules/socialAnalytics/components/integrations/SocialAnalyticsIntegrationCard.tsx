import type { Integration } from "~/models/Integration"
import { useShowIntegrationProviderIcon } from "~/hooks/api/integrations/useShowIntegrationProviderIcon"
import { SocialAnalyticsIntegrationInsightType, socialAnalyticsIntegrationInsightTypeToFrenchTranslation } from "../../models/enums/SocialAnalyticsIntegrationInsightType"
import { useListSocialAnalyticsIntegrationInsights } from "../../hooks/api/socialAnalyticsIntegrationInsight/useListSocialAnalyticsIntegrationInsights"

interface SocialAnalyticsIntegrationCardProps {
    integration: Integration
    insightType: SocialAnalyticsIntegrationInsightType
    onClick?: () => void
}

export default function SocialAnalyticsIntegrationCard({
    integration,
    insightType,
    onClick,
}: SocialAnalyticsIntegrationCardProps) {
    const { iconUrl } = useShowIntegrationProviderIcon(integration.provider)
    const { socialAnalyticsIntegrationInsights, isLoading, error } = useListSocialAnalyticsIntegrationInsights({ integrationUuid: integration.uuid })

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

                {iconUrl && (
                    <img
                        src={iconUrl}
                        alt={integration.provider}
                        className="ml-20 size-7 rounded-md object-cover"
                    />
                )}
            </div>
            <div className="border-t border-light-gray rounded w-full"></div>

            <div>
                <h1 className="text-heading-sm">{socialAnalyticsIntegrationInsights.find((insight) => insight.type === insightType)?.value}</h1>
                <p className="text-body-sm text-gray whitespace-nowrap">
                    {socialAnalyticsIntegrationInsightTypeToFrenchTranslation[insightType]}
                </p>
            </div>
        </div>
    )
}
