import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { postGroupQueryKeys } from "./postGroupQueryKeys";

export function useDeletePostGroup() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (postGroupUuid: string) => {
            await httpClient.delete(`/post-groups/${postGroupUuid}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: postGroupQueryKeys.all })
        },
    })

    return {
        deletePostGroup: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    }
}
