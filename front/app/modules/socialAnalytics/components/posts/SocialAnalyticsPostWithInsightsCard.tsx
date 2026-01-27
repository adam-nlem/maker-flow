import { EyeIcon } from "@heroicons/react/24/solid";
import type { SocialAnalyticsPostWithInsightsDTO } from "../../dtos/socialAnalyticsPosts/SocialAnalyticsPostWithInsightsDTO";
import { useShowSocialAnalyticsPostThumbnail } from "../../hooks/api/socialAnalyticsPosts/useShowSocialAnalyticsPostThumbnail";
import { SocialAnalyticsPostInsightType, socialAnalyticsPostInsightTypeToIcon } from "../../models/enums/SocialAnalyticsPostInsightType";

interface SocialAnalyticsPostWithInsightsCardProps {
    postWithInsights: SocialAnalyticsPostWithInsightsDTO
}

export default function SocialAnalyticsPostWithInsightsCard({ postWithInsights }: SocialAnalyticsPostWithInsightsCardProps) {
    const { thumbnailUrl } = useShowSocialAnalyticsPostThumbnail(postWithInsights.uuid);

    const viewsInsight = postWithInsights.insights.find((insight) => insight.type === SocialAnalyticsPostInsightType.Views);

    return (
        <div className="flex flex-row gap-1 w-fit shrink-0">
            {thumbnailUrl && <img src={thumbnailUrl} alt="" className="w-20 rounded" />}
            <div className="flex flex-col gap-1">
                {postWithInsights.insights.map(function (insight) {
                    const Icon = socialAnalyticsPostInsightTypeToIcon[insight.type];
                    return (
                        <div className="flex flex-row items-center gap-1">
                            <Icon className="size-3 text-dark" />
                            <p className="text-xs">{insight.value}</p>

                            {insight.evolutionPercentage !== undefined && insight.evolutionPercentage !== null && (
                                <span title="Évolution par rapport au contenu précédent à la même durée après publication"
                                    className={`text-heading-xs ${insight.evolutionPercentage.startsWith('+') ? "text-green-500" : "text-red-500"
                                        }`}
                                >
                                    {insight.evolutionPercentage}
                                </span>
                            )}
                        </div>);
                })}
            </div>
        </div>
    )
}