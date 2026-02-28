import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { scriptGenerationQueryKeys } from "./scriptGenerationQueryKeys";
import { ScriptGeneration, type ScriptGenerationJSON } from "~/models/ScriptGeneration";

interface UseListScriptGenerationsParams {
    scriptUuid: string;
}

export function useListScriptGenerations({ scriptUuid }: UseListScriptGenerationsParams) {
    const query = useQuery({
        queryKey: scriptGenerationQueryKeys.list(scriptUuid),
        queryFn: async () => {
            const response = await httpClient.get<ScriptGenerationJSON[]>('/script-generations', {
                params: { scriptUuid },
            });
            return response.data.map(ScriptGeneration.fromJSON);
        },
        enabled: !!scriptUuid,
    });

    return {
        generations: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error,
    };
}
