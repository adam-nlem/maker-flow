import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
    const [page, setPage] = useState(1);
    const [additionalPosts, setAdditionalPosts] = useState<PostListItemDTO[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const query = useQuery({
        queryKey: postQueryKeys.list(projectUuid ?? '', platform, searchTerm),
        queryFn: async () => {
            const params: Record<string, string | number> = {
                projectUuid: projectUuid!,
                ...(searchTerm ? { searchTerm } : {}),
                page: 1,
                limit,
            };
            if (platform) params.platform = platform;

            const res = await httpClient.get<PostListItemDTOJSON[]>(`/posts`, { params });
            const postsData = res.data.map((json) => PostListItemDTO.fromJSON(json));
            setHasMore(postsData.length === limit);
            setAdditionalPosts([]);
            setPage(1);
            return postsData;
        },
        enabled: !!projectUuid,
    });

    const posts = useMemo(() => {
        return [...(query.data ?? []), ...additionalPosts];
    }, [query.data, additionalPosts]);

    const listMore = useCallback(async () => {
        if (isLoadingMore || !hasMore) return;

        setIsLoadingMore(true);
        const nextPage = page + 1;

        try {
            const params: Record<string, string | number> = {
                projectUuid: projectUuid!,
                ...(searchTerm ? { searchTerm } : {}),
                page: nextPage,
                limit,
            };
            if (platform) params.platform = platform;

            const res = await httpClient.get<PostListItemDTOJSON[]>(`/posts`, { params });
            const postsData = res.data.map((json) => PostListItemDTO.fromJSON(json));
            setAdditionalPosts(prev => [...prev, ...postsData]);
            setHasMore(postsData.length === limit);
            setPage(nextPage);
        } finally {
            setIsLoadingMore(false);
        }
    }, [page, isLoadingMore, hasMore, limit, projectUuid, platform, searchTerm]);

    return {
        posts,
        isLoading: query.isLoading,
        isLoadingMore,
        hasMore,
        error: query.error,
        listMore,
    };
}
