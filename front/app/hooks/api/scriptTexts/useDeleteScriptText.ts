import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { scriptQueryKeys } from "../scripts/scriptQueryKeys";

interface DeleteScriptTextData {
    textUuid: string;
    scriptUuid: string;
}

export function useDeleteScriptText() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async ({ textUuid }: DeleteScriptTextData) => {
            await httpClient.delete(`/scripts/texts/${textUuid}`)
        },
        onSuccess: (_, { scriptUuid }) => {
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.parts(scriptUuid) })
        },
    })

    return {
        deleteScriptText: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
