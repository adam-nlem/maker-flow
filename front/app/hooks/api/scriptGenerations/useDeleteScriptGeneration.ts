import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { scriptGenerationQueryKeys } from "./scriptGenerationQueryKeys";

interface DeleteScriptGenerationData {
    generationUuid: string;
    scriptUuid: string;
}

export function useDeleteScriptGeneration() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async ({ generationUuid }: DeleteScriptGenerationData) => {
            await httpClient.delete(`/script-generations/${generationUuid}`);
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: scriptGenerationQueryKeys.list(variables.scriptUuid) });
        },
    });

    return {
        deleteScriptGeneration: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    };
}
