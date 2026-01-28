import { ArrowDownCircleIcon, ArrowTrendingDownIcon, ArrowTrendingUpIcon, ArrowUpCircleIcon, EyeIcon } from "@heroicons/react/24/solid";
import type { SocialAnalyticsPostWithInsightsDTO } from "../../dtos/socialAnalyticsPosts/SocialAnalyticsPostWithInsightsDTO";
import { useShowSocialAnalyticsPostThumbnail } from "../../hooks/api/socialAnalyticsPosts/useShowSocialAnalyticsPostThumbnail";
import { SocialAnalyticsPostInsightType, socialAnalyticsPostInsightTypeToIcon } from "../../models/enums/SocialAnalyticsPostInsightType";
import { formatToFrenchRelative } from "~/utils/dateFormatters";
import { formatDurationToFrenchHumanReadable } from "~/utils/durationFormatters";
import Shimmer from "~/components/ui/Shimmer";

interface SocialAnalyticsPostWithInsightsCardProps {
    postWithInsights: SocialAnalyticsPostWithInsightsDTO
}

export default function SocialAnalyticsPostWithInsightsCard({ postWithInsights }: SocialAnalyticsPostWithInsightsCardProps) {
    const { thumbnailUrl, isLoading } = useShowSocialAnalyticsPostThumbnail(postWithInsights.uuid);

    const viewsInsight = postWithInsights.insights.find((insight) => insight.type === SocialAnalyticsPostInsightType.Views);

    return (
        <div className="flex flex-col gap-1 w-fit shrink-0">

            <div className="flex flex-row gap-1">
                {thumbnailUrl ? <img src={thumbnailUrl} alt="" className="w-20 rounded" /> : <Shimmer height="h-full" width="w-20" />}
                <div className="flex flex-col gap-1">
                    {postWithInsights.insights.map(function (insight) {
                        const Icon = socialAnalyticsPostInsightTypeToIcon[insight.type];
                        return (
                            <div className="flex flex-row items-center gap-1">
                                <Icon className="size-3 text-dark" />
                                {insight.type === SocialAnalyticsPostInsightType.TotalWatchTime || insight.type === SocialAnalyticsPostInsightType.AverageWatchTime ? (
                                    <p className="text-xs">{formatDurationToFrenchHumanReadable(insight.value)}</p>
                                ) : (
                                    <p className="text-xs">{insight.value}</p>
                                )}

                                {insight.evolutionPercentage !== undefined && insight.evolutionPercentage !== null && (
                                    <div className="flex flex-row items-center">

                                        <p title="Évolution par rapport au contenu précédent à la même durée après publication"
                                            className={`text-heading-xs ${insight.evolutionPercentage.startsWith('+') ? "text-green-500" : "text-red-500"
                                                }`}
                                        >
                                            {insight.evolutionPercentage}
                                        </p>
                                        {insight.evolutionPercentage.startsWith('+') ? <ArrowTrendingUpIcon className="size-4 text-green-500" strokeWidth={2} /> : <ArrowTrendingDownIcon className="size-4 text-red-500" strokeWidth={2} />}
                                    </div>
                                )}
                            </div>);
                    })}

                </div>
            </div>
            <p className="text-heading-xs">Publié {formatToFrenchRelative(postWithInsights.publishedAt)}</p>
        </div>
    )
}