import type { Integration } from "~/models/Integration";
import { useListSocialAnalyticsIntegrationInsights } from "../../hooks/api/socialAnalyticsIntegrationInsight/useListSocialAnalyticsIntegrationInsights";
import SocialAnalyticsInsightTile from "../SocialAnalyticsInsightTile";
import { SocialAnalyticsIntegrationInsightType, socialAnalyticsIntegrationInsightTypeToFrenchTranslation } from "../../models/enums/SocialAnalyticsIntegrationInsightType";
import { ArrowTrendingUpIcon, DocumentCheckIcon, UserIcon } from "@heroicons/react/24/solid";

interface SocialAnalyticsIntegrationPageViewProps {
    integration: Integration
}

export default function SocialAnalyticsIntegrationPageView({ integration }: SocialAnalyticsIntegrationPageViewProps) {

    const { socialAnalyticsIntegrationInsights, isLoading, error } = useListSocialAnalyticsIntegrationInsights({ integrationUuid: integration.uuid })

    console.log(socialAnalyticsIntegrationInsights)

    if (isLoading) {
        return null;
    }


    return (<div>
        <div className="flex flex-row gap-1 items-center">
            {integration.profilePictureUrl && (
                <img
                    src={integration.profilePictureUrl}
                    alt="profile picture"
                    className="size-10 rounded-full object-cover"
                />
            )}
            <div className="flex flex-col">
                <h1 className="text-heading-sm">{integration.name}</h1>
                <p className="text-body-sm text-gray">{integration.userName}</p>
            </div>
        </div>

        <div className="flex flex-row gap-3">
            <SocialAnalyticsInsightTile
                insight={socialAnalyticsIntegrationInsights.find((insight) => insight.type === SocialAnalyticsIntegrationInsightType.TotalFollowers)!}
                Icon={UserIcon}
                getLabel={(type) => socialAnalyticsIntegrationInsightTypeToFrenchTranslation[type]}
            />
            <SocialAnalyticsInsightTile
                insight={socialAnalyticsIntegrationInsights.find((insight) => insight.type === SocialAnalyticsIntegrationInsightType.TotalFollowers)!}
                Icon={DocumentCheckIcon}
                getLabel={(type) => socialAnalyticsIntegrationInsightTypeToFrenchTranslation[type]}
            />
            <SocialAnalyticsInsightTile
                insight={socialAnalyticsIntegrationInsights.find((insight) => insight.type === SocialAnalyticsIntegrationInsightType.TotalFollowers)!}
                Icon={ArrowTrendingUpIcon}
                getLabel={(type) => socialAnalyticsIntegrationInsightTypeToFrenchTranslation[type]}
            />
            
        </div>
        {socialAnalyticsIntegrationInsights.map((integrationInsight) => <SocialAnalyticsInsightTile
            insight={integrationInsight}
            Icon={UserIcon}
            getLabel={(type) => socialAnalyticsIntegrationInsightTypeToFrenchTranslation[type]}
        />)}
    </div>)
}