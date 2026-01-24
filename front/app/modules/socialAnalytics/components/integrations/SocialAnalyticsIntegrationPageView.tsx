import type { Integration } from "~/models/Integration";
import SocialAnalyticsInsightTile from "../SocialAnalyticsInsightTile";
import { SocialAnalyticsIntegrationInsightType, socialAnalyticsIntegrationInsightTypeToFrenchTranslation } from "../../models/enums/SocialAnalyticsIntegrationInsightType";
import { ArrowTrendingUpIcon, DocumentTextIcon, FireIcon, UserIcon } from "@heroicons/react/24/solid";
import { useSocialAnalyticsFilterStore } from "../../stores/socialAnalyticsFilterStore";
import { useShowSocialAnalyticsIntegrationDetail } from "../../hooks/api/socialAnalyticsIntegrationInsight/useShowSocialAnalyticsIntegrationDetail";

interface SocialAnalyticsIntegrationPageViewProps {
    integration: Integration
}

export default function SocialAnalyticsIntegrationPageView({ integration }: SocialAnalyticsIntegrationPageViewProps) {
    const timePeriod = useSocialAnalyticsFilterStore((state) => state.timePeriod);

    const { detail, isLoading } = useShowSocialAnalyticsIntegrationDetail({
        integrationUuid: integration.uuid,
        timePeriod,
    });

    if (isLoading || !detail) {
        return null;
    }


    return (
        <div className="mt-5">
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

            <div className="flex flex-row gap-3 mt-3">
                <SocialAnalyticsInsightTile
                    label={socialAnalyticsIntegrationInsightTypeToFrenchTranslation[SocialAnalyticsIntegrationInsightType.TotalFollowers]}
                    value={detail.totalFollowers}
                    Icon={UserIcon}
                />
                <SocialAnalyticsInsightTile
                    label="Contenus"
                    value={detail.postCount}
                    Icon={DocumentTextIcon}
                />
                <SocialAnalyticsInsightTile
                    label="Momentum"
                    value={detail.streak}
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