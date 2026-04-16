import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { HookTemplate, type HookTemplateJSON } from "~/models/HookTemplate";
import { hookTemplateQueryKeys } from "./hookTemplateQueryKeys";

interface UseListPaginatedHookTemplatesProps {
    searchTerm?: string;
    limit?: number;
}

export function useListPaginatedHookTemplates({ searchTerm, limit = 20 }: UseListPaginatedHookTemplatesProps = {}) {
    const query = useInfiniteQuery({
        queryKey: hookTemplateQueryKeys.list(searchTerm),
        queryFn: async ({ pageParam }) => {
            const res = await httpClient.get<HookTemplateJSON[]>('/hook-templates', {
                params: {
                    ...(searchTerm ? { searchTerm } : {}),
                    page: pageParam,
                    limit,
                },
            });
            return res.data.map((json) => HookTemplate.fromJSON(json));
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, _, lastPageParam) =>
            lastPage.length === limit ? lastPageParam + 1 : undefined,
    });

    const hookTemplates = useMemo(() => query.data?.pages.flat() ?? [], [query.data]);

    return {
        hookTemplates,
        isLoading: query.isLoading,
        isLoadingMore: query.isFetchingNextPage,
        hasMore: query.hasNextPage,
        error: query.error,
        listMore: query.fetchNextPage,
    };
}
