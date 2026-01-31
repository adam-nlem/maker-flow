import { ArrowTrendingDownIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/solid";
import type { SocialAnalyticsPostWithInsightsDTO } from "../../dtos/socialAnalyticsPosts/SocialAnalyticsPostWithInsightsDTO";
import { useShowSocialAnalyticsPostThumbnail } from "../../hooks/api/socialAnalyticsPosts/useShowSocialAnalyticsPostThumbnail";
import { SocialAnalyticsPostInsightType } from "../../models/enums/SocialAnalyticsPostInsightType";
import { formatToFrenchRelative } from "~/utils/dateFormatters";
import { formatDurationToFrenchHumanReadable } from "~/utils/durationFormatters";
import Shimmer from "~/components/ui/Shimmer";
import type { SocialAnalyticsPostInsightWithEvolutionDTO } from "../../dtos/socialAnalyticsPosts/SocialAnalyticsPostInsightWithEvolutionDTO";

interface SocialAnalyticsPostsTableRowProps {
    post: SocialAnalyticsPostWithInsightsDTO;
}

function findInsight(
    insights: SocialAnalyticsPostInsightWithEvolutionDTO[],
    type: SocialAnalyticsPostInsightType,
): SocialAnalyticsPostInsightWithEvolutionDTO | undefined {
    return insights.find((insight) => insight.type === type);
}

function EvolutionBadge({ evolutionPercentage }: { evolutionPercentage: string | null }) {
    if (!evolutionPercentage) return null;

    const isPositive = evolutionPercentage.startsWith('+');

    return (
        <div
            className={`${isPositive ? "text-green-500 bg-green-100" : "text-red-500 bg-red-100"} w-fit h-fit p-0.5 rounded flex flex-row items-center gap-1`}
            title="Évolution par rapport au contenu précédent à la même durée après publication"
        >
            {isPositive
                ? <ArrowTrendingUpIcon className="size-3" />
                : <ArrowTrendingDownIcon className="size-3" />
            }
            <p className="text-xs">{evolutionPercentage}</p>

        </div>
    );
}

function NumericCell({ insight }: { insight: SocialAnalyticsPostInsightWithEvolutionDTO | undefined }) {
    if (!insight) return <td className="px-3 py-2 text-center text-sm">—</td>;

    return (
        <td className="px-3 py-2 text-left text-sm ">
            <div className="flex flex-row items-center gap-1">
                {insight.value}
                <EvolutionBadge evolutionPercentage={insight.evolutionPercentage} />
            </div>
        </td>
    );
}

function DurationCell({ insight }: { insight: SocialAnalyticsPostInsightWithEvolutionDTO | undefined }) {
    if (!insight) return <td className="px-3 py-2 text-center text-sm">—</td>;

    return (
        <td className="px-3 py-2 text-left text-sm ">
            <div className="flex flex-row items-center gap-1">
                {formatDurationToFrenchHumanReadable(insight.value)}
                <EvolutionBadge evolutionPercentage={insight.evolutionPercentage} />
            </div>
        </td>
    );
}

export default function SocialAnalyticsPostsTableRow({ post }: SocialAnalyticsPostsTableRowProps) {
    const { thumbnailUrl } = useShowSocialAnalyticsPostThumbnail(post.uuid);

    const viewsInsight = findInsight(post.insights, SocialAnalyticsPostInsightType.Views);
    const totalInteractionsInsight = findInsight(post.insights, SocialAnalyticsPostInsightType.TotalInteractions);
    const avgWatchTimeInsight = findInsight(post.insights, SocialAnalyticsPostInsightType.AverageWatchTime);
    const totalWatchTimeInsight = findInsight(post.insights, SocialAnalyticsPostInsightType.TotalWatchTime);

    return (
        <tr className="border-t border-light-gray hover:bg-gray-50 cursor-pointer">
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

            <NumericCell insight={viewsInsight} />
            <NumericCell insight={totalInteractionsInsight} />
            <DurationCell insight={avgWatchTimeInsight} />
        </tr>
    );
}
