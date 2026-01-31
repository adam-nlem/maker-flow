import type { Integration } from "~/models/Integration";
import SocialAnalyticsInsightTile from "../SocialAnalyticsInsightTile";
import { SocialAnalyticsIntegrationInsightType, socialAnalyticsIntegrationInsightTypeToFrenchTranslation, socialAnalyticsIntegrationInsightTypeToIcon } from "../../models/enums/SocialAnalyticsIntegrationInsightType";
import { ArrowTrendingUpIcon, DocumentTextIcon, UserIcon } from "@heroicons/react/24/solid";
import { useSocialAnalyticsFilterStore } from "../../stores/socialAnalyticsFilterStore";
import { useShowSocialAnalyticsIntegrationDetail } from "../../hooks/api/socialAnalyticsIntegrationInsights/useShowSocialAnalyticsIntegrationDetail";
import { useListPaginatedSocialAnalyticsPosts } from "../../hooks/api/socialAnalyticsPosts/useListPaginatedSocialAnalyticsPosts";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { CalendarHeatMap } from "~/components/ui/CalendarHeatMap";
import AreaChart from "~/components/ui/AreaChart";
import { socialAnalyticsTimePeriodToDays } from "../../models/enums/SocialAnalyticsTimePeriod";
import { computeTotalValue, getChartDataForInsightType, getFilteredInsightsForType } from "../../helpers/insightChartDataHelper";
import { filterPostsByDays } from "../../helpers/postFilterHelper";
import SocialAnalyticsPostsTable from "../posts/SocialAnalyticsPostsTable";



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
        limit: 10,
    });

    const days = socialAnalyticsTimePeriodToDays[timePeriod];

    if (isLoading || !detail) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3 mt-5 flex-1 min-h-0">
            <div className="flex flex-row items-center bg-amber-300/10 p-3 gap-3 rounded-lg border border-amber-300">
                <ExclamationTriangleIcon className="size-5 text-amber-500" strokeWidth={2} />
                <p className="text-xs text-amber-500">
                    Instagram ne nous permet pas d'acceder à l'historique de vos comptes Instagram. Nous construisons cet historique en interne à partir des données disponibles.
                    Donc, plus votre compte est connecté depuis longtemps, plus l'historique sera complet.
                </p>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
                <div className="flex flex-col gap-3">
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

                    <div className="flex flex-wrap wrap-break-word gap-3">
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
                        {detail.dailyPoints.map((detailPoint) => {
                            if (detailPoint.type !== SocialAnalyticsIntegrationInsightType.TotalFollowers) {
                                return <SocialAnalyticsInsightTile
                                    key={detailPoint.type}
                                    label={socialAnalyticsIntegrationInsightTypeToFrenchTranslation[detailPoint.type]}
                                    value={computeTotalValue(getFilteredInsightsForType(detail.dailyPoints, detailPoint.type, days))}
                                    Icon={socialAnalyticsIntegrationInsightTypeToIcon[detailPoint.type]}
                                    chart={<AreaChart color="var(--color-primary)" data={getChartDataForInsightType(detail.dailyPoints, detailPoint.type, days)} />}
                                />
                            }
                            return null;
                        })
                        }
                    </div>
                </div>

                {/* <CalendarHeatMap totalValue={computeTotalValue(getFilteredInsightsForType(detail.dailyPoints, SocialAnalyticsIntegrationInsightType.Reach, days))} data={getChartDataForInsightType(detail.dailyPoints, SocialAnalyticsIntegrationInsightType.Reach, days)} daysToDisplay={socialAnalyticsTimePeriodToDays[timePeriod]} /> */}

            </div>


            <SocialAnalyticsPostsTable
                posts={filterPostsByDays(posts, days)}
                hasMore={hasMore}
                onLoadMore={listMore}
            />
        </div>
    );
}