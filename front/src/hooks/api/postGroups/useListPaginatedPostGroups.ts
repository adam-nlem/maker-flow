import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { PostGroupListItemDTO, type PostGroupListItemDTOJSON } from "~/dtos/postGroups/PostGroupListItemDTO";
import { httpClient } from "~/services/httpClient/httpClient";
import { postGroupQueryKeys } from "./postGroupQueryKeys";

interface UseListPostGroupsProps {
    projectUuid: string | null;
    limit?: number;
}

export function useListPaginatedPostGroups({ projectUuid, limit = 20 }: UseListPostGroupsProps) {
    const [page, setPage] = useState(1);
    const [additionalGroups, setAdditionalGroups] = useState<PostGroupListItemDTO[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const query = useQuery({
        queryKey: postGroupQueryKeys.list(projectUuid ?? ''),
        queryFn: async () => {
            const res = await httpClient.get<PostGroupListItemDTOJSON[]>('/post-groups', {
                params: {
                    projectUuid: projectUuid!,
                    page: 1,
                    limit,
                },
            });
            const groupsData = res.data.map((json) => PostGroupListItemDTO.fromJSON(json));
            setHasMore(groupsData.length === limit);
            setAdditionalGroups([]);
            setPage(1);
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
            const res = await httpClient.get<PostGroupListItemDTOJSON[]>('/post-groups', {
                params: {
                    projectUuid: projectUuid!,
                    page: nextPage,
                    limit,
                },
            });
            const groupsData = res.data.map((json) => PostGroupListItemDTO.fromJSON(json));
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
