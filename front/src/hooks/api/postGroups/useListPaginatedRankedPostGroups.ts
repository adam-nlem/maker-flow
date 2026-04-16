import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { PostGroupWithAggregatedInsightsDTO, type PostGroupWithAggregatedInsightsDTOJSON } from "~/dtos/postGroups/PostGroupWithAggregatedInsightsDTO";
import { httpClient } from "~/services/httpClient/httpClient";
import { postGroupQueryKeys } from "./postGroupQueryKeys";

interface UseListPaginatedRankedPostGroupsProps {
    projectUuid: string | null;
    limit?: number;
}

export function useListPaginatedRankedPostGroups({ projectUuid, limit = 10 }: UseListPaginatedRankedPostGroupsProps) {
    const query = useInfiniteQuery({
        queryKey: postGroupQueryKeys.rank(projectUuid ?? ''),
        queryFn: async ({ pageParam }) => {
            const res = await httpClient.get<PostGroupWithAggregatedInsightsDTOJSON[]>(`/post-groups/rank`, {
                params: {
                    projectUuid,
                    page: pageParam,
                    limit,
                }
            });
            return res.data.map((json) => PostGroupWithAggregatedInsightsDTO.fromJSON(json));
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, _, lastPageParam) =>
            lastPage.length === limit ? lastPageParam + 1 : undefined,
        enabled: !!projectUuid,
    });

    const postGroups = useMemo(() => query.data?.pages.flat() ?? [], [query.data]);

    return {
        postGroups,
        isLoading: query.isLoading,
        isLoadingMore: query.isFetchingNextPage,
        hasMore: query.hasNextPage,
        error: query.error,
        listMore: query.fetchNextPage,
    };
}
