import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { Script, type ScriptJSON } from "~/models/Script";
import type { ScriptStatus } from "~/models/enums/ScriptStatus";
import { scriptQueryKeys } from "./scriptQueryKeys";

interface UseListPaginatedScriptsProps {
    projectUuid: string;
    limit?: number;
    status?: ScriptStatus;
}

export function useListPaginatedScripts({ projectUuid, limit = 20, status }: UseListPaginatedScriptsProps) {
    const [page, setPage] = useState(1);
    const [additionalScripts, setAdditionalScripts] = useState<Script[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const query = useQuery({
        queryKey: scriptQueryKeys.list(projectUuid, status),
        queryFn: async () => {
            const res = await httpClient.get<ScriptJSON[]>('/scripts', {
                params: {
                    projectUuid,
                    page: 1,
                    limit,
                    ...(status && { status }),
                },
            });
            const scriptsData = res.data.map((json) => Script.fromJSON(json));
            setHasMore(scriptsData.length === limit);
            setAdditionalScripts([]);
            setPage(1);
            return scriptsData;
        },
    });

    const scripts = useMemo(() => {
        return [...(query.data ?? []), ...additionalScripts];
    }, [query.data, additionalScripts]);

    const listMore = useCallback(async () => {
        if (isLoadingMore || !hasMore) return;

        setIsLoadingMore(true);
        const nextPage = page + 1;

        try {
            const res = await httpClient.get<ScriptJSON[]>('/scripts', {
                params: {
                    projectUuid,
                    page: nextPage,
                    limit,
                    ...(status && { status }),
                },
            });
            const scriptsData = res.data.map((json) => Script.fromJSON(json));
            setAdditionalScripts((prev) => [...prev, ...scriptsData]);
            setHasMore(scriptsData.length === limit);
            setPage(nextPage);
        } finally {
            setIsLoadingMore(false);
        }
    }, [page, isLoadingMore, hasMore, limit, projectUuid, status]);

    return {
        scripts,
        isLoading: query.isLoading,
        isLoadingMore,
        hasMore,
        error: query.error,
        listMore,
    };
}
