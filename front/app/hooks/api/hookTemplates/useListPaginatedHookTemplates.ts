import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { HookTemplate, type HookTemplateJSON } from "~/models/HookTemplate";
import { hookTemplateQueryKeys } from "./hookTemplateQueryKeys";

interface UseListPaginatedHookTemplatesProps {
    searchTerm?: string;
    limit?: number;
}

export function useListPaginatedHookTemplates({ searchTerm, limit = 20 }: UseListPaginatedHookTemplatesProps = {}) {
    const [page, setPage] = useState(1);
    const [additionalTemplates, setAdditionalTemplates] = useState<HookTemplate[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const query = useQuery({
        queryKey: hookTemplateQueryKeys.list(searchTerm),
        queryFn: async () => {
            const res = await httpClient.get<HookTemplateJSON[]>('/hook-templates', {
                params: {
                    ...(searchTerm ? { searchTerm } : {}),
                    page: 1,
                    limit,
                },
            });
            const templatesData = res.data.map((json) => HookTemplate.fromJSON(json));
            setHasMore(templatesData.length === limit);
            setAdditionalTemplates([]);
            setPage(1);
            return templatesData;
        },
    });

    const hookTemplates = useMemo(() => {
        return [...(query.data ?? []), ...additionalTemplates];
    }, [query.data, additionalTemplates]);

    const listMore = useCallback(async () => {
        if (isLoadingMore || !hasMore) return;

        setIsLoadingMore(true);
        const nextPage = page + 1;

        try {
            const res = await httpClient.get<HookTemplateJSON[]>('/hook-templates', {
                params: {
                    ...(searchTerm ? { searchTerm } : {}),
                    page: nextPage,
                    limit,
                },
            });
            const templatesData = res.data.map((json) => HookTemplate.fromJSON(json));
            setAdditionalTemplates((prev) => [...prev, ...templatesData]);
            setHasMore(templatesData.length === limit);
            setPage(nextPage);
        } finally {
            setIsLoadingMore(false);
        }
    }, [page, isLoadingMore, hasMore, limit, searchTerm]);

    return {
        hookTemplates,
        isLoading: query.isLoading,
        isLoadingMore,
        hasMore,
        error: query.error,
        listMore,
    };
}
