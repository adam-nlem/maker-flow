import { useMutation, useQueryClient } from "@tanstack/react-query"
import { httpClient } from "~/services/httpClient/httpClient"
import { AnalyticsEvent } from "~/models/enums/AnalyticsEvent"
import { track } from "~/services/analytics/analytics"
import { collaboratorQueryKeys } from "./collaboratorQueryKeys"

export function useRemoveCollaborator() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (userUuid: string) => {
            await httpClient.delete(`/agencies/collaborators/${userUuid}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: collaboratorQueryKeys.all })
            track(AnalyticsEvent.CollaboratorRemoved)
        },
    })

    return {
        removeCollaborator: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    }
}
