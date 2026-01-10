import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { projectQueryKeys } from "./projectQueryKeys";


export function useDeleteProject() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (projectUuid: string) => {
            await httpClient.delete(`/projects/${projectUuid}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectQueryKeys.all })
        },
    })

    return {
        deleteProject: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    }
}