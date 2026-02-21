import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { scriptQueryKeys } from "./scriptQueryKeys";

export function useDeleteScript() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (scriptUuid: string) => {
            await httpClient.delete(`/scripts/${scriptUuid}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.all })
        },
    })

    return {
        deleteScript: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
