import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { Script, type ScriptJSON } from "~/models/Script";
import type { ScriptStatus } from "~/models/enums/ScriptStatus";
import { scriptQueryKeys } from "./scriptQueryKeys";

interface UseListPaginatedScriptsProps {
    projectUuid: string | null;
    limit?: number;
    status?: ScriptStatus;
}

export function useListPaginatedScripts({ projectUuid, limit = 20, status }: UseListPaginatedScriptsProps) {
    const query = useInfiniteQuery({
        queryKey: scriptQueryKeys.list(projectUuid ?? '', status),
        queryFn: async ({ pageParam }) => {
            const res = await httpClient.get<ScriptJSON[]>('/scripts', {
                params: {
                    projectUuid,
                    page: pageParam,
                    limit,
                    ...(status && { status }),
                },
            });
            return res.data.map((json) => Script.fromJSON(json));
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, _, lastPageParam) =>
            lastPage.length === limit ? lastPageParam + 1 : undefined,
        enabled: !!projectUuid,
    });

    const scripts = useMemo(() => query.data?.pages.flat() ?? [], [query.data]);

    return {
        scripts,
        isLoading: query.isLoading,
        isLoadingMore: query.isFetchingNextPage,
        hasMore: query.hasNextPage,
        error: query.error,
        listMore: query.fetchNextPage,
    };
}
