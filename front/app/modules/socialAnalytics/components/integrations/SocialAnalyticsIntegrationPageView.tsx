import type { Integration } from "~/models/Integration";
import SocialAnalyticsInsightTile from "../SocialAnalyticsInsightTile";
import { SocialAnalyticsIntegrationInsightType, socialAnalyticsIntegrationInsightTypeToFrenchTranslation } from "../../models/enums/SocialAnalyticsIntegrationInsightType";
import { ArrowTrendingUpIcon, DocumentTextIcon, EyeIcon, UserIcon } from "@heroicons/react/24/solid";
import { useSocialAnalyticsFilterStore } from "../../stores/socialAnalyticsFilterStore";
import { useShowSocialAnalyticsIntegrationDetail } from "../../hooks/api/socialAnalyticsIntegrationInsights/useShowSocialAnalyticsIntegrationDetail";
import { useListPaginatedSocialAnalyticsPosts } from "../../hooks/api/socialAnalyticsPosts/useListPaginatedSocialAnalyticsPosts";
import SocialAnalyticsPostWithInsightsCard from "../posts/SocialAnalyticsPostWithInsightsCard";
import SimpleTextButton from "~/components/ui/SimpleTextButton";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { CalendarHeatMap } from "~/components/ui/CalendarHeatMap";
import AreaChart from "~/components/ui/AreaChart";
import { SocialAnalyticsTimePeriod, socialAnalyticsTimePeriodToDays } from "../../models/enums/SocialAnalyticsTimePeriod";
import { computeEvolutionPercentage } from "../../helpers/insightEvolutionHelper";
import { getChartDataForInsightType } from "../../helpers/insightChartDataHelper";



interface SocialAnalyticsIntegrationPageViewProps {
    integration: Integration
}

export default function SocialAnalyticsIntegrationPageView({ integration }: SocialAnalyticsIntegrationPageViewProps) {
    const timePeriod = useSocialAnalyticsFilterStore((state) => state.timePeriod);

    const { detail, isLoading } = useShowSocialAnalyticsIntegrationDetail({
        integrationUuid: integration.uuid,
    });

    const { posts, isLoadingMore, hasMore, listMore } = useListPaginatedSocialAnalyticsPosts({
        integrationUuid: integration.uuid,
        timePeriod,
        limit: 10,
    });

    const days = socialAnalyticsTimePeriodToDays[timePeriod];

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
                    chart={<AreaChart color="var(--color-primary)" data={getChartDataForInsightType(detail.dailyPoints, SocialAnalyticsIntegrationInsightType.TotalFollowers, days)} />}
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

                <CalendarHeatMap data={getChartDataForInsightType(detail.dailyPoints, SocialAnalyticsIntegrationInsightType.Views, days)} daysToDisplay={socialAnalyticsTimePeriodToDays[timePeriod]} />
            </div>

            <div className="flex flex-row flex-wrap gap-3 mt-3">
                {detail.insights.map((insight) => (
                    <SocialAnalyticsInsightTile
                        key={insight.type}
                        label={socialAnalyticsIntegrationInsightTypeToFrenchTranslation[insight.type]}
                        value={insight.value}
                        Icon={EyeIcon}
                        evolutionPercentage={
                            timePeriod === SocialAnalyticsTimePeriod.LastYear
                                ? insight.evolutionPercentage
                                : computeEvolutionPercentage(detail.dailyPoints, insight.type, days)
                        }
                    />
                ))}
            </div>

            <div className="flex flex-row gap-3 mt-3 w-full overflow-auto scrollbar-none">
                {posts.map((post) => (
                    <SocialAnalyticsPostWithInsightsCard
                        key={post.uuid}
                        postWithInsights={post}
                    />
                ))}

                {hasMore && <SimpleTextButton onClick={listMore}>
                    <ArrowPathIcon className="size-3.5" strokeWidth={2} />
                    <p>Charger plus de contenus</p>
                </SimpleTextButton>}
            </div>
        </div>
    );
}