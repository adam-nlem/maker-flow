import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { PostListItemDTO, type PostListItemDTOJSON } from "~/dtos/posts/PostListItemDTO";
import { postQueryKeys } from "./postQueryKeys";
import type { Platform } from "~/models/enums/Platform";

interface UseListPaginatedPostsProps {
    projectUuid: string | null;
    platform: Platform | null;
    searchTerm?: string;
    limit?: number;
}

export function useListPaginatedPosts({ projectUuid, platform, searchTerm, limit = 20 }: UseListPaginatedPostsProps) {
    const query = useInfiniteQuery({
        queryKey: postQueryKeys.list(projectUuid ?? '', platform, searchTerm),
        queryFn: async ({ pageParam }) => {
            const params: Record<string, string | number> = {
                projectUuid: projectUuid!,
                ...(searchTerm ? { searchTerm } : {}),
                page: pageParam,
                limit,
            };
            if (platform) params.platform = platform;

            const res = await httpClient.get<PostListItemDTOJSON[]>(`/posts`, { params });
            return res.data.map((json) => PostListItemDTO.fromJSON(json));
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, _, lastPageParam) =>
            lastPage.length === limit ? lastPageParam + 1 : undefined,
        enabled: !!projectUuid,
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
