import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { scriptGenerationQueryKeys } from "./scriptGenerationQueryKeys";
import { ScriptGeneration, type ScriptGenerationJSON } from "~/models/ScriptGeneration";

interface UseListScriptGenerationsParams {
    scriptUuid: string;
    limit?: number;
}

export function useListScriptGenerations({ scriptUuid, limit = 10 }: UseListScriptGenerationsParams) {
    const [page, setPage] = useState(1);
    const [additionalGenerations, setAdditionalGenerations] = useState<ScriptGeneration[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const query = useQuery({
        queryKey: scriptGenerationQueryKeys.list(scriptUuid),
        queryFn: async () => {
            const response = await httpClient.get<ScriptGenerationJSON[]>('/script-generations', {
                params: { scriptUuid, page: 1, limit },
            });
            const generationsData = response.data.map(ScriptGeneration.fromJSON);
            setHasMore(generationsData.length === limit);
            setAdditionalGenerations([]);
            setPage(1);
            return generationsData;
        },
        enabled: !!scriptUuid,
    });

    const generations = useMemo(() => {
        return [...(query.data ?? []), ...additionalGenerations];
    }, [query.data, additionalGenerations]);

    const listMore = useCallback(async () => {
        if (isLoadingMore || !hasMore) return;

        setIsLoadingMore(true);
        const nextPage = page + 1;

        try {
            const response = await httpClient.get<ScriptGenerationJSON[]>('/script-generations', {
                params: { scriptUuid, page: nextPage, limit },
            });
            const generationsData = response.data.map(ScriptGeneration.fromJSON);
            setAdditionalGenerations((prev) => [...prev, ...generationsData]);
            setHasMore(generationsData.length === limit);
            setPage(nextPage);
        } finally {
            setIsLoadingMore(false);
        }
    }, [page, isLoadingMore, hasMore, limit, scriptUuid]);

    return {
        generations,
        isLoading: query.isLoading,
        isLoadingMore,
        hasMore,
        error: query.error,
        listMore,
    };
}
