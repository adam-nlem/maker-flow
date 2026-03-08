import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { scriptTagQueryKeys } from "./scriptTagQueryKeys";
import { scriptQueryKeys } from "../scripts/scriptQueryKeys";


export function useDeleteScriptTag() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (tagUuid: string) => {
            await httpClient.delete(`/scripts/tags/${tagUuid}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: scriptTagQueryKeys.all })
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.all })
        },
    })

    return {
        deleteScriptTag: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    }
}
