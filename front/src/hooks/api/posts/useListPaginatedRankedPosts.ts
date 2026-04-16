import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { PostWithAggregatedInsightsDTO, type PostWithAggregatedInsightsDTOJSON } from "~/dtos/posts/PostWithAggregatedInsightsDTO";
import { httpClient } from "~/services/httpClient/httpClient";
import { postQueryKeys } from "./postQueryKeys";

interface UseListPaginatedRankedPostsProps {
    integrationUuid: string | null;
    limit?: number;
}

export function useListPaginatedRankedPosts({ integrationUuid, limit = 10 }: UseListPaginatedRankedPostsProps) {
    const query = useInfiniteQuery({
        queryKey: postQueryKeys.rank(integrationUuid ?? ''),
        queryFn: async ({ pageParam }) => {
            const res = await httpClient.get<PostWithAggregatedInsightsDTOJSON[]>(`/posts/rank`, {
                params: {
                    integrationUuid,
                    page: pageParam,
                    limit,
                }
            });
            return res.data.map((json) => PostWithAggregatedInsightsDTO.fromJSON(json));
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, _, lastPageParam) =>
            lastPage.length === limit ? lastPageParam + 1 : undefined,
        enabled: !!integrationUuid,
    });

    const posts = useMemo(() => query.data?.pages.flat() ?? [], [query.data]);

    return {
        posts,
        isLoading: query.isLoading,
        isLoadingMore: query.isFetchingNextPage,
        hasMore: query.hasNextPage,
        error: query.error,
        listMore: query.fetchNextPage,
    };
}
