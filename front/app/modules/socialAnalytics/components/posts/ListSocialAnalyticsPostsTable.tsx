import { useEffect, useRef, useMemo } from "react";
import { SocialAnalyticsPostInsightType, socialAnalyticsPostInsightTypeToFrenchTranslation } from "../../models/enums/SocialAnalyticsPostInsightType";
import { useListPaginatedSocialAnalyticsPosts } from "../../hooks/api/socialAnalyticsPosts/useListPaginatedSocialAnalyticsPosts";
import { useSocialAnalyticsFilterStore } from "../../stores/socialAnalyticsFilterStore";
import { socialAnalyticsTimePeriodToDays } from "../../models/enums/SocialAnalyticsTimePeriod";
import { filterPostsByDays } from "../../helpers/postFilterHelper";
import SocialAnalyticsPostsTableRow from "./SocialAnalyticsPostsTableRow";

interface ListSocialAnalyticsPostsTableProps {
    integrationUuid: string;
}

export default function ListSocialAnalyticsPostsTable({ integrationUuid }: ListSocialAnalyticsPostsTableProps) {
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
            <div className="border border-light-gray rounded-lg overflow-auto scrollbar-none flex-1 min-h-0">
                <table className="w-full table-auto">
                    <thead className="sticky top-0 bg-white z-10">
                        <tr className="border-b border-light-gray text-body-xs">
                            <th className=" text-left px-3 py-2">Description</th>
                            <th className="text-right px-3 py-2">{socialAnalyticsPostInsightTypeToFrenchTranslation[SocialAnalyticsPostInsightType.Views]}</th>
                            <th className="text-right px-3 py-2">{socialAnalyticsPostInsightTypeToFrenchTranslation[SocialAnalyticsPostInsightType.TotalInteractions]}</th>
                            <th className="text-right px-3 py-2">{socialAnalyticsPostInsightTypeToFrenchTranslation[SocialAnalyticsPostInsightType.AverageWatchTime]}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPosts.map((post) => (
                            <SocialAnalyticsPostsTableRow key={post.uuid} post={post} />
                        ))}
                    </tbody>
                </table>
                <div ref={sentinelRef} className="h-1" />
            </div>
        </div>
    );
}
