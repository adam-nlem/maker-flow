import { useState, useEffect, useCallback } from "react";
import { httpClient } from "~/services/httpClient/httpClient";
import { CustomHttpException } from "~/services/httpClient/customHttpExceptions";
import { Module } from "~/models/Module";

export function useListPaginatedModules(limit: number = 10) {
    const [modules, setModules] = useState<Module[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const listPaginatedModules = useCallback(async (pageToFetch: number, append: boolean = false) => {
        if (append) {
            setIsLoadingMore(true);
        } else {
            setIsLoading(true);
        }

        try {
            const res = await httpClient.get(`/modules`, {
                params: {
                    page: pageToFetch,
                    limit: limit
                }
            });
            const modulesData = res.data.map((json: any) => Module.fromJSON(json));

            if (append) {
                setModules(prev => [...prev, ...modulesData]);
            } else {
                setModules(modulesData);
            }

            // If we received fewer items than the limit, there are no more pages
            setHasMore(modulesData.length === limit);
            setErrorMessage(null);
        } catch (err) {
            setErrorMessage(err instanceof CustomHttpException ? err.errorMessage : "Une erreur est survenue");
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [limit]);

    useEffect(() => {
        listPaginatedModules(1, false);
    }, [listPaginatedModules]);

    const listMore = useCallback(() => {
        if (!isLoadingMore && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            listPaginatedModules(nextPage, true);
        }
    }, [page, isLoadingMore, hasMore, listPaginatedModules]);

    function addModuleInList(newModule: Module) {
        setModules(prev =>
            prev.some(module => module.uuid === newModule.uuid)
                ? prev
                : [...prev, newModule],
        );
    }
    return {
        modules,
        isLoading,
        isLoadingMore,
        hasMore,
        errorMessage,
        listMore,
        addModuleInList,
    };
}
