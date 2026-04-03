import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { AnalyticsEvent } from "~/models/enums/AnalyticsEvent";
import { track } from "~/services/analytics/analytics";
import { projectQueryKeys } from "./projectQueryKeys";


export function useDeleteProject() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (projectUuid: string) => {
            await httpClient.delete(`/projects/${projectUuid}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectQueryKeys.all })
            track(AnalyticsEvent.ProjectDeleted)
        },
    })

    return {
        deleteProject: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    }
}