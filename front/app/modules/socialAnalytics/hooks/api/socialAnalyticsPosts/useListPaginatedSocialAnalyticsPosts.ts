import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { SocialAnalyticsPostWithInsightsDTO, type SocialAnalyticsPostWithInsightsDTOJSON } from "~/modules/socialAnalytics/dtos/socialAnalyticsPosts/SocialAnalyticsPostWithInsightsDTO";
import { socialAnalyticsPostQueryKeys } from "./socialAnalyticsPostQueryKeys";
import type { SocialAnalyticsTimePeriod } from "~/modules/socialAnalytics/models/enums/SocialAnalyticsTimePeriod";

interface UseListPaginatedSocialAnalyticsPostsProps {
    limit?: number;
    integrationUuid: string;
    timePeriod: SocialAnalyticsTimePeriod;
}

export function useListPaginatedSocialAnalyticsPosts({ limit = 10, integrationUuid, timePeriod }: UseListPaginatedSocialAnalyticsPostsProps) {
    const [page, setPage] = useState(1);
    const [additionalPosts, setAdditionalPosts] = useState<SocialAnalyticsPostWithInsightsDTO[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const query = useQuery({
        queryKey: socialAnalyticsPostQueryKeys.list(integrationUuid, timePeriod),
        queryFn: async () => {
            const res = await httpClient.get<SocialAnalyticsPostWithInsightsDTOJSON[]>(`/modules/social-analytics/posts`, {
                params: {
                    integrationUuid,
                    timePeriod,
                    page: 1,
                    limit,
                }
            });
            const postsData = res.data.map((json) => SocialAnalyticsPostWithInsightsDTO.fromJSON(json));
            setHasMore(postsData.length === limit);
            setAdditionalPosts([]);
            setPage(1);
            return postsData;
        },
    });

    const posts = useMemo(() => {
        return [...(query.data ?? []), ...additionalPosts];
    }, [query.data, additionalPosts]);

    const listMore = useCallback(async () => {
        if (isLoadingMore || !hasMore) return;

        setIsLoadingMore(true);
        const nextPage = page + 1;

        try {
            const res = await httpClient.get<SocialAnalyticsPostWithInsightsDTOJSON[]>(`/modules/social-analytics/posts`, {
                params: {
                    integrationUuid,
                    timePeriod,
                    page: nextPage,
                    limit,
                }
            });
            const postsData = res.data.map((json) => SocialAnalyticsPostWithInsightsDTO.fromJSON(json));
            setAdditionalPosts(prev => [...prev, ...postsData]);
            setHasMore(postsData.length === limit);
            setPage(nextPage);
        } finally {
            setIsLoadingMore(false);
        }
    }, [page, isLoadingMore, hasMore, limit, integrationUuid, timePeriod]);

    return {
        posts,
        isLoading: query.isLoading,
        isLoadingMore,
        hasMore,
        error: query.error,
        listMore,
    };
}