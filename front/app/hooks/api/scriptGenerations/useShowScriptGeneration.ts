import { useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { scriptGenerationQueryKeys } from "./scriptGenerationQueryKeys";
import { ScriptGeneration, type ScriptGenerationJSON } from "~/models/ScriptGeneration";
import { ScriptGenerationStatus } from "~/models/enums/ScriptGenerationStatus";
import { scriptQueryKeys } from "../scripts/scriptQueryKeys";

interface UseShowScriptGenerationParams {
    generationUuid: string | null;
    scriptUuid: string;
}

export function useShowScriptGeneration({ generationUuid, scriptUuid }: UseShowScriptGenerationParams) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: scriptGenerationQueryKeys.show(generationUuid ?? ''),
        queryFn: async () => {
            const response = await httpClient.get<ScriptGenerationJSON>(`/script-generations/${generationUuid}`);
            return ScriptGeneration.fromJSON(response.data);
        },
        enabled: !!generationUuid,
        refetchInterval: (query) => {
            const data = query.state.data;
            if (!data) return false;
            if (data.status === ScriptGenerationStatus.Pending || data.status === ScriptGenerationStatus.Processing) {
                return 2000;
            }
            return false;
        },
    });

    // Invalidate generation-scoped parts and generation list when generation completes
    const generation = query.data;
    if (generation?.status === ScriptGenerationStatus.Completed) {
        queryClient.invalidateQueries({ queryKey: scriptQueryKeys.parts(scriptUuid, generationUuid ?? undefined) });
        queryClient.invalidateQueries({ queryKey: scriptGenerationQueryKeys.list(scriptUuid) });
    }

    return {
        generation: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error,
    };
}
