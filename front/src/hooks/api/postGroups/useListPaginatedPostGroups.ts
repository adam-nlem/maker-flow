import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { PostGroupWithInsightsAndScriptDTO, type PostGroupWithInsightsAndScriptDTOJSON } from "~/dtos/postGroups/PostGroupWithInsightsAndScriptDTO";
import { httpClient } from "~/services/httpClient/httpClient";
import { postGroupQueryKeys } from "./postGroupQueryKeys";

interface UseListPostGroupsProps {
    projectUuid: string | null;
    limit?: number;
}

export function useListPaginatedPostGroups({ projectUuid, limit = 12 }: UseListPostGroupsProps) {
    const [page, setPage] = useState(1);
    const [additionalGroups, setAdditionalGroups] = useState<PostGroupWithInsightsAndScriptDTO[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const query = useQuery({
        queryKey: postGroupQueryKeys.list(projectUuid ?? ''),
        queryFn: async () => {
            const res = await httpClient.get<PostGroupWithInsightsAndScriptDTOJSON[]>('/post-groups', {
                params: {
                    projectUuid: projectUuid!,
                    page: 1,
                    limit,
                },
            });
            const groupsData = res.data.map((json) => PostGroupWithInsightsAndScriptDTO.fromJSON(json));
            setHasMore(groupsData.length === limit);
            setAdditionalGroups([]);
            setPage(1);
            console.log(groupsData)
            return groupsData;
        },
        enabled: !!projectUuid,
    });

    const postGroups = useMemo(() => {
        return [...(query.data ?? []), ...additionalGroups];
    }, [query.data, additionalGroups]);

    const listMore = useCallback(async () => {
        if (isLoadingMore || !hasMore) return;

        setIsLoadingMore(true);
        const nextPage = page + 1;

        try {
            const res = await httpClient.get<PostGroupWithInsightsAndScriptDTOJSON[]>('/post-groups', {
                params: {
                    projectUuid: projectUuid!,
                    page: nextPage,
                    limit,
                },
            });
            const groupsData = res.data.map((json) => PostGroupWithInsightsAndScriptDTO.fromJSON(json));
            setAdditionalGroups(prev => [...prev, ...groupsData]);
            setHasMore(groupsData.length === limit);
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
