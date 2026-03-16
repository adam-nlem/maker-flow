import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { scriptQueryKeys } from "../scripts/scriptQueryKeys";

interface DeleteScriptShotData {
    shotUuid: string;
    scriptUuid: string;
}

export function useDeleteScriptShot() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async ({ shotUuid }: DeleteScriptShotData) => {
            await httpClient.delete(`/scripts/shots/${shotUuid}`)
        },
        onSuccess: (_, { scriptUuid }) => {
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.parts(scriptUuid) })
        },
    })

    return {
        deleteScriptShot: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
