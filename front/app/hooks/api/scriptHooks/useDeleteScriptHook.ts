import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { scriptQueryKeys } from "../scripts/scriptQueryKeys";

interface DeleteScriptHookData {
    hookUuid: string;
    scriptUuid: string;
}

export function useDeleteScriptHook() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async ({ hookUuid }: DeleteScriptHookData) => {
            await httpClient.delete(`/scripts/hooks/${hookUuid}`)
        },
        onSuccess: (_, { scriptUuid }) => {
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.parts(scriptUuid) })
        },
    })

    return {
        deleteScriptHook: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
