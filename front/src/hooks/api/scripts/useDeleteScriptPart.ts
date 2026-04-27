import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { scriptQueryKeys } from "./scriptQueryKeys";

interface DeleteScriptPartInput {
    scriptUuid: string;
    partUuid: string;
}

export function useDeleteScriptPart() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async ({ partUuid }: DeleteScriptPartInput) => {
            await httpClient.delete(`/script-parts/${partUuid}`);
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.parts(variables.scriptUuid) });
        },
    });

    return {
        deleteScriptPart: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    };
}
