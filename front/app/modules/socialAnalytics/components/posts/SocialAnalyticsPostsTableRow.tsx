import { useNavigate } from "react-router";
import type { SocialAnalyticsPostWithInsightsDTO } from "../../dtos/socialAnalyticsPosts/SocialAnalyticsPostWithInsightsDTO";
import { useShowSocialAnalyticsPostThumbnail } from "../../hooks/api/socialAnalyticsPosts/useShowSocialAnalyticsPostThumbnail";
import { SocialAnalyticsPostInsightType, socialAnalyticsPostInsightTypeToFrenchTranslation } from "../../models/enums/SocialAnalyticsPostInsightType";
import { formatToFrenchRelative } from "~/utils/dateFormatters";
import Shimmer from "~/components/ui/Shimmer";
import type { SocialAnalyticsPostInsightWithEvolutionDTO } from "../../dtos/socialAnalyticsPosts/SocialAnalyticsPostInsightWithEvolutionDTO";
import SocialAnalyticsPostNumericCell from "./SocialAnalyticsPostNumericCell";
import SocialAnalyticsPostDurationCell from "./SocialAnalyticsPostDurationCell";

interface SocialAnalyticsPostsTableRowProps {
    post: SocialAnalyticsPostWithInsightsDTO;
}

function findInsight(
    insights: SocialAnalyticsPostInsightWithEvolutionDTO[],
    type: SocialAnalyticsPostInsightType,
): SocialAnalyticsPostInsightWithEvolutionDTO | undefined {
    return insights.find((insight) => insight.insight.type === type);
}

export default function SocialAnalyticsPostsTableRow({ post }: SocialAnalyticsPostsTableRowProps) {
    const navigate = useNavigate();
    const { thumbnailUrl } = useShowSocialAnalyticsPostThumbnail(post.uuid);

    const viewsInsight = findInsight(post.insights, SocialAnalyticsPostInsightType.Views);
    const totalInteractionsInsight = findInsight(post.insights, SocialAnalyticsPostInsightType.TotalInteractions);
    const likesInsight = findInsight(post.insights, SocialAnalyticsPostInsightType.Likes);
    const commentsInsight = findInsight(post.insights, SocialAnalyticsPostInsightType.Comments);
    const sharesInsight = findInsight(post.insights, SocialAnalyticsPostInsightType.Shares);
    const avgWatchTimeInsight = findInsight(post.insights, SocialAnalyticsPostInsightType.AverageWatchTime);

    return (
        <tr className="border-t border-light-gray hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/modules/social_analytics/posts/${post.uuid}`)}>
            <td className="px-3 py-2">
                <div className="flex flex-row items-center gap-2">
                    {thumbnailUrl
                        ? <img src={thumbnailUrl} alt="" className="w-10 h-10 rounded object-cover shrink-0" />
                        : <Shimmer width="w-10" height="h-10" radius="rounded" />
                    }
                    <div className="flex flex-col min-w-0 max-w-xs">
                        {post.caption && (
                            <p className="text-xs truncate">{post.caption}</p>
                        )}
                        <p className="text-body-xs text-gray">
                            {formatToFrenchRelative(post.publishedAt)}
                        </p>
                    </div>
                </div>
            </td>

            <SocialAnalyticsPostNumericCell insight={viewsInsight} />
            <SocialAnalyticsPostNumericCell
                insight={totalInteractionsInsight}
                tooltip={
                    <div className="flex flex-col gap-1">
                        <p>{socialAnalyticsPostInsightTypeToFrenchTranslation[SocialAnalyticsPostInsightType.Likes]}: {likesInsight?.insight.value ?? "—"}</p>
                        <p>{socialAnalyticsPostInsightTypeToFrenchTranslation[SocialAnalyticsPostInsightType.Comments]}: {commentsInsight?.insight.value ?? "—"}</p>
                        <p>{socialAnalyticsPostInsightTypeToFrenchTranslation[SocialAnalyticsPostInsightType.Shares]}: {sharesInsight?.insight.value ?? "—"}</p>
                    </div>
                }
            />
            <SocialAnalyticsPostDurationCell insight={avgWatchTimeInsight} />
        </tr>
    );
}
