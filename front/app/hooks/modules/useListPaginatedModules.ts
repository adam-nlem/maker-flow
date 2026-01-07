import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { Module, type ModuleJSON } from "~/models/Module";
import { moduleQueryKeys } from "./moduleQueryKeys";

export function useListPaginatedModules(limit: number = 10) {
    const [page, setPage] = useState(1);
    const [additionalModules, setAdditionalModules] = useState<Module[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const query = useQuery({
        queryKey: moduleQueryKeys.list(1, limit),
        queryFn: async () => {
            const res = await httpClient.get(`/modules`, {
                params: {
                    page: 1,
                    limit: limit
                }
            });
            const modulesData: Module[] = res.data.map((json: ModuleJSON) => Module.fromJSON(json));
            setHasMore(modulesData.length === limit);
            setAdditionalModules([]);
            setPage(1);
            return modulesData;
        },
    })

    const modules = useMemo(() => {
        return [...(query.data ?? []), ...additionalModules];
    }, [query.data, additionalModules]);

    const listMore = useCallback(async () => {
        if (isLoadingMore || !hasMore) return;

        setIsLoadingMore(true);
        const nextPage = page + 1;

        try {
            const res = await httpClient.get(`/modules`, {
                params: {
                    page: nextPage,
                    limit: limit
                }
            });
            const modulesData: Module[] = res.data.map((json: ModuleJSON) => Module.fromJSON(json));
            setAdditionalModules(prev => [...prev, ...modulesData]);
            setHasMore(modulesData.length === limit);
            setPage(nextPage);
        } finally {
            setIsLoadingMore(false);
        }
    }, [page, isLoadingMore, hasMore, limit]);

    return {
        modules,
        isLoading: query.isLoading,
        isLoadingMore,
        hasMore,
        error: query.error,
        listMore,
    };
}
