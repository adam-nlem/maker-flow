import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { PostWithAggregatedInsightsDTO, type PostWithAggregatedInsightsDTOJSON } from "~/dtos/posts/PostWithAggregatedInsightsDTO";
import { httpClient } from "~/services/httpClient/httpClient";
import { postQueryKeys } from "./postQueryKeys";

interface UseListPaginatedRankedPostsProps {
    integrationUuid: string;
    limit?: number;
}

export function useListPaginatedRankedPosts({ integrationUuid, limit = 10 }: UseListPaginatedRankedPostsProps) {
    const [page, setPage] = useState(1);
    const [additionalPosts, setAdditionalPosts] = useState<PostWithAggregatedInsightsDTO[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const query = useQuery({
        queryKey: postQueryKeys.rank(integrationUuid),
        queryFn: async () => {
            const res = await httpClient.get<PostWithAggregatedInsightsDTOJSON[]>(`/posts/rank`, {
                params: {
                    integrationUuid,
                    page: 1,
                    limit,
                }
            });
            const postsData = res.data.map((json) => PostWithAggregatedInsightsDTO.fromJSON(json));
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
            const res = await httpClient.get<PostWithAggregatedInsightsDTOJSON[]>(`/posts/rank`, {
                params: {
                    integrationUuid,
                    page: nextPage,
                    limit,
                }
            });
            const postsData = res.data.map((json) => PostWithAggregatedInsightsDTO.fromJSON(json));
            setAdditionalPosts(prev => [...prev, ...postsData]);
            setHasMore(postsData.length === limit);
            setPage(nextPage);
        } finally {
            setIsLoadingMore(false);
        }
    }, [page, isLoadingMore, hasMore, limit, integrationUuid]);

    return {
        posts,
        isLoading: query.isLoading,
        isLoadingMore,
        hasMore,
        error: query.error,
        listMore,
    };
}
