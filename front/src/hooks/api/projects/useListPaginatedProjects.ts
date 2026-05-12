import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Project } from "~/models/Project";
import { httpClient } from "~/services/httpClient/httpClient";
import { projectQueryKeys } from "./projectQueryKeys";

interface UseListPaginatedProjectsOptions {
    limit?: number;
    enabled?: boolean;
}

export function useListPaginatedProjects(options: UseListPaginatedProjectsOptions | number = {}) {
    const { limit = 10, enabled = true } = typeof options === "number" ? { limit: options } : options;

    const query = useInfiniteQuery({
        queryKey: projectQueryKeys.list(limit),
        queryFn: async ({ pageParam }) => {
            const res = await httpClient.get(`/projects`, {
                params: {
                    page: pageParam,
                    limit,
                }
            });
            return res.data.map((json: any) => Project.fromJSON(json));
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, _, lastPageParam) =>
            lastPage.length === limit ? lastPageParam + 1 : undefined,
        enabled,
    });

    const projects = useMemo(() => query.data?.pages.flat() ?? [], [query.data]);

    return {
        projects,
        isLoading: query.isLoading,
        isLoadingMore: query.isFetchingNextPage,
        hasMore: query.hasNextPage,
        error: query.error,
        listMore: query.fetchNextPage,
    };
}
