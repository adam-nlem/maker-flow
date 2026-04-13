import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { scriptGenerationQueryKeys } from "./scriptGenerationQueryKeys";
import { ScriptGeneration, type ScriptGenerationJSON } from "~/models/ScriptGeneration";

interface UseListScriptGenerationsParams {
    scriptUuid: string;
    limit?: number;
}

export function useListScriptGenerations({ scriptUuid, limit = 10 }: UseListScriptGenerationsParams) {
    const query = useInfiniteQuery({
        queryKey: scriptGenerationQueryKeys.list(scriptUuid),
        queryFn: async ({ pageParam }) => {
            const response = await httpClient.get<ScriptGenerationJSON[]>('/script-generations', {
                params: { scriptUuid, page: pageParam, limit },
            });
            return response.data.map(ScriptGeneration.fromJSON);
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, _, lastPageParam) =>
            lastPage.length === limit ? lastPageParam + 1 : undefined,
        enabled: !!scriptUuid,
    });

    const generations = useMemo(() => query.data?.pages.flat() ?? [], [query.data]);

    return {
        generations,
        isLoading: query.isLoading,
        isLoadingMore: query.isFetchingNextPage,
        hasMore: query.hasNextPage,
        error: query.error,
        listMore: query.fetchNextPage,
    };
}
