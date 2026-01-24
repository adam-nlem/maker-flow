import type { Integration } from "~/models/Integration";
import { useShowSocialAnalyticsIntegrationOverview } from "../../hooks/api/socialAnalyticsIntegrationInsight/useShowSocialAnalyticsIntegrationOverview";
import SocialAnalyticsInsightTile from "../SocialAnalyticsInsightTile";
import { SocialAnalyticsIntegrationInsightType, socialAnalyticsIntegrationInsightTypeToFrenchTranslation } from "../../models/enums/SocialAnalyticsIntegrationInsightType";
import { ArrowTrendingUpIcon, DocumentTextIcon, FireIcon, UserIcon } from "@heroicons/react/24/solid";
import { useSocialAnalyticsFilterStore } from "../../stores/socialAnalyticsFilterStore";

interface SocialAnalyticsIntegrationPageViewProps {
    integration: Integration
}

export default function SocialAnalyticsIntegrationPageView({ integration }: SocialAnalyticsIntegrationPageViewProps) {
    const timePeriod = useSocialAnalyticsFilterStore((state) => state.timePeriod);

    const { overview, isLoading } = useShowSocialAnalyticsIntegrationOverview({
        integrationUuid: integration.uuid,
        timePeriod,
    });

    if (isLoading || !overview) {
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
                label={socialAnalyticsIntegrationInsightTypeToFrenchTranslation[SocialAnalyticsIntegrationInsightType.TotalFollowers]}
                value={overview.totalFollowers}
                Icon={UserIcon}
            />
            <SocialAnalyticsInsightTile
                label="Contenus"
                value={overview.postCount}
                Icon={DocumentTextIcon}
            />
            <SocialAnalyticsInsightTile
                label="Momentum"
                value={overview.streak}
                Icon={ArrowTrendingUpIcon}

            />

        </div>
        {/* {socialAnalyticsIntegrationInsights.map((integrationInsight) => <SocialAnalyticsInsightTile
            insight={integrationInsight}
            Icon={UserIcon}
            getLabel={(type) => socialAnalyticsIntegrationInsightTypeToFrenchTranslation[type]}
        />)} */}
    </div>)
}