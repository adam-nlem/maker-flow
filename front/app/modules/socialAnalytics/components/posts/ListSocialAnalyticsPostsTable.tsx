import { useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router";
import DataTable, { type DataTableColumn } from "~/components/ui/DataTable";
import { SocialAnalyticsPostInsightType, socialAnalyticsPostInsightTypeToFrenchTranslation } from "../../models/enums/SocialAnalyticsPostInsightType";
import { useListPaginatedSocialAnalyticsPosts } from "../../hooks/api/socialAnalyticsPosts/useListPaginatedSocialAnalyticsPosts";
import { useSocialAnalyticsFilterStore } from "../../stores/socialAnalyticsFilterStore";
import { socialAnalyticsTimePeriodToDays } from "../../models/enums/SocialAnalyticsTimePeriod";
import { filterPostsByDays } from "../../helpers/postFilterHelper";
import type { SocialAnalyticsPostWithInsightsDTO } from "../../dtos/socialAnalyticsPosts/SocialAnalyticsPostWithInsightsDTO";
import type { SocialAnalyticsPostInsightWithEvolutionDTO } from "../../dtos/socialAnalyticsPosts/SocialAnalyticsPostInsightWithEvolutionDTO";
import SocialAnalyticsPostDescriptionCell from "./SocialAnalyticsPostDescriptionCell";
import SocialAnalyticsPostNumericCell from "./SocialAnalyticsPostNumericCell";
import SocialAnalyticsPostDurationCell from "./SocialAnalyticsPostDurationCell";

function findInsight(
    insights: SocialAnalyticsPostInsightWithEvolutionDTO[],
    type: SocialAnalyticsPostInsightType,
): SocialAnalyticsPostInsightWithEvolutionDTO | undefined {
    return insights.find((insight) => insight.insight.type === type);
}

const columns: DataTableColumn<SocialAnalyticsPostWithInsightsDTO>[] = [
    {
        header: "Description",
        render: (post) => <SocialAnalyticsPostDescriptionCell post={post} />,
    },
    {
        header: socialAnalyticsPostInsightTypeToFrenchTranslation[SocialAnalyticsPostInsightType.Views],
        render: (post) => (
            <SocialAnalyticsPostNumericCell insight={findInsight(post.insights, SocialAnalyticsPostInsightType.Views)} />
        ),
    },
    {
        header: socialAnalyticsPostInsightTypeToFrenchTranslation[SocialAnalyticsPostInsightType.TotalInteractions],
        render: (post) => {
            const likesInsight = findInsight(post.insights, SocialAnalyticsPostInsightType.Likes);
            const commentsInsight = findInsight(post.insights, SocialAnalyticsPostInsightType.Comments);
            const sharesInsight = findInsight(post.insights, SocialAnalyticsPostInsightType.Shares);

            return (
                <SocialAnalyticsPostNumericCell
                    insight={findInsight(post.insights, SocialAnalyticsPostInsightType.TotalInteractions)}
                    tooltip={
                        <div className="flex flex-col gap-1">
                            <p>{socialAnalyticsPostInsightTypeToFrenchTranslation[SocialAnalyticsPostInsightType.Likes]}: {likesInsight?.insight.value ?? "—"}</p>
                            <p>{socialAnalyticsPostInsightTypeToFrenchTranslation[SocialAnalyticsPostInsightType.Comments]}: {commentsInsight?.insight.value ?? "—"}</p>
                            <p>{socialAnalyticsPostInsightTypeToFrenchTranslation[SocialAnalyticsPostInsightType.Shares]}: {sharesInsight?.insight.value ?? "—"}</p>
                        </div>
                    }
                />
            );
        },
    },
    {
        header: socialAnalyticsPostInsightTypeToFrenchTranslation[SocialAnalyticsPostInsightType.AverageWatchTime],
        render: (post) => (
            <SocialAnalyticsPostDurationCell insight={findInsight(post.insights, SocialAnalyticsPostInsightType.AverageWatchTime)} />
        ),
    },
];

interface ListSocialAnalyticsPostsTableProps {
    integrationUuid: string;
}

export default function ListSocialAnalyticsPostsTable({ integrationUuid }: ListSocialAnalyticsPostsTableProps) {
    const navigate = useNavigate();
    const timePeriod = useSocialAnalyticsFilterStore((state) => state.timePeriod);
    const days = socialAnalyticsTimePeriodToDays[timePeriod];

    const { posts, isLoadingMore, hasMore, listMore } = useListPaginatedSocialAnalyticsPosts({
        integrationUuid,
        limit: 10,
    });

    const filteredPosts = useMemo(() => filterPostsByDays(posts, days), [posts, days]);

    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
                    listMore();
                }
            },
            { rootMargin: "0px 0px 200px 0px" },
        );

        observer.observe(sentinel);

        return () => {
            observer.disconnect();
        };
    }, [hasMore, isLoadingMore, listMore]);

    return (
        <div className="flex flex-col gap-2 flex-1 min-h-0 w-2/3">
            <h1 className="text-heading-sm">Derniers contenus</h1>
            <DataTable<SocialAnalyticsPostWithInsightsDTO>
                columns={columns}
                data={filteredPosts}
                getRowKey={(post) => post.uuid}
                onRowClick={(post) => navigate(`/modules/social_analytics/posts/${post.uuid}`)}
                afterTable={<div ref={sentinelRef} className="h-1" />}
                className="flex-1 min-h-0"
            />
        </div>
    );
}
