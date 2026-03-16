import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { PostWithInsightsDTO, type PostWithInsightsDTOJSON } from "~/dtos/posts/PostWithInsightsDTO";
import { postQueryKeys } from "./postQueryKeys";

interface UseListPaginatedPostsProps {
    limit?: number;
    integrationUuid: string | null;
}

export function useListPaginatedPosts({ limit = 10, integrationUuid }: UseListPaginatedPostsProps) {
    const [page, setPage] = useState(1);
    const [additionalPosts, setAdditionalPosts] = useState<PostWithInsightsDTO[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const query = useQuery({
        queryKey: postQueryKeys.list(integrationUuid ?? ''),
        queryFn: async () => {
            const res = await httpClient.get<PostWithInsightsDTOJSON[]>(`/posts`, {
                params: {
                    integrationUuid,
                    page: 1,
                    limit,
                }
            });
            const postsData = res.data.map((json) => PostWithInsightsDTO.fromJSON(json));
            setHasMore(postsData.length === limit);
            setAdditionalPosts([]);
            setPage(1);
            return postsData;
        },
        enabled: !!integrationUuid,
    });

    const posts = useMemo(() => {
        return [...(query.data ?? []), ...additionalPosts];
    }, [query.data, additionalPosts]);

    const listMore = useCallback(async () => {
        if (isLoadingMore || !hasMore) return;

        setIsLoadingMore(true);
        const nextPage = page + 1;

        try {
            const res = await httpClient.get<PostWithInsightsDTOJSON[]>(`/posts`, {
                params: {
                    integrationUuid,
                    page: nextPage,
                    limit,
                }
            });
            const postsData = res.data.map((json) => PostWithInsightsDTO.fromJSON(json));
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