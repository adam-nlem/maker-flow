import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { PostGroupWithAggregatedInsightsDTO, type PostGroupWithAggregatedInsightsDTOJSON } from "~/dtos/postGroups/PostGroupWithAggregatedInsightsDTO";
import { httpClient } from "~/services/httpClient/httpClient";
import { postGroupQueryKeys } from "./postGroupQueryKeys";

interface UseListPaginatedRankedPostGroupsProps {
    projectUuid: string | null;
    limit?: number;
}

export function useListPaginatedRankedPostGroups({ projectUuid, limit = 10 }: UseListPaginatedRankedPostGroupsProps) {
    const [page, setPage] = useState(1);
    const [additionalPostGroups, setAdditionalPostGroups] = useState<PostGroupWithAggregatedInsightsDTO[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const query = useQuery({
        queryKey: postGroupQueryKeys.rank(projectUuid ?? ''),
        queryFn: async () => {
            const res = await httpClient.get<PostGroupWithAggregatedInsightsDTOJSON[]>(`/post-groups/rank`, {
                params: {
                    projectUuid,
                    page: 1,
                    limit,
                }
            });
            const postGroupsData = res.data.map((json) => PostGroupWithAggregatedInsightsDTO.fromJSON(json));
            setHasMore(postGroupsData.length === limit);
            setAdditionalPostGroups([]);
            setPage(1);
            return postGroupsData;
        },
        enabled: !!projectUuid,
    });

    const postGroups = useMemo(() => {
        return [...(query.data ?? []), ...additionalPostGroups];
    }, [query.data, additionalPostGroups]);

    const listMore = useCallback(async () => {
        if (isLoadingMore || !hasMore) return;

        setIsLoadingMore(true);
        const nextPage = page + 1;

        try {
            const res = await httpClient.get<PostGroupWithAggregatedInsightsDTOJSON[]>(`/post-groups/rank`, {
                params: {
                    projectUuid,
                    page: nextPage,
                    limit,
                }
            });
            const postGroupsData = res.data.map((json) => PostGroupWithAggregatedInsightsDTO.fromJSON(json));
            setAdditionalPostGroups(prev => [...prev, ...postGroupsData]);
            setHasMore(postGroupsData.length === limit);
            setPage(nextPage);
        } finally {
            setIsLoadingMore(false);
        }
    }, [page, isLoadingMore, hasMore, limit, projectUuid]);

    return {
        postGroups,
        isLoading: query.isLoading,
        isLoadingMore,
        hasMore,
        error: query.error,
        listMore,
    };
}
