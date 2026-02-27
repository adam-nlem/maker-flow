import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { scriptGenerationQueryKeys } from "./scriptGenerationQueryKeys";
import { ScriptGeneration, type ScriptGenerationJSON } from "~/models/ScriptGeneration";

interface UseLatestScriptGenerationParams {
    scriptUuid: string;
}

export function useLatestScriptGeneration({ scriptUuid }: UseLatestScriptGenerationParams) {
    const query = useQuery({
        queryKey: scriptGenerationQueryKeys.latest(scriptUuid),
        queryFn: async () => {
            try {
                const response = await httpClient.get<ScriptGenerationJSON>('/script-generations', {
                    params: { scriptUuid },
                });
                return ScriptGeneration.fromJSON(response.data);
            } catch (error: any) {
                if (error?.response?.status === 404) {
                    return null;
                }
                throw error;
            }
        },
        enabled: !!scriptUuid,
    });

    return {
        latestGeneration: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error,
    };
}
