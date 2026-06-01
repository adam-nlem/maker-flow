import { useMutation, useQueryClient } from "@tanstack/react-query"
import { httpClient } from "~/services/httpClient/httpClient"
import { AnalyticsEvent } from "~/models/enums/AnalyticsEvent"
import { track } from "~/services/analytics/analytics"
import { projectClientQueryKeys } from "./projectClientQueryKeys"

interface RemoveClientData {
    projectUuid: string;
    clientUserUuid: string;
}

export function useRemoveClient() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (data: RemoveClientData) => {
            await httpClient.delete(`/projects/clients/${data.clientUserUuid}`)
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: projectClientQueryKeys.list(variables.projectUuid) })
            track(AnalyticsEvent.ClientRemoved, { project_uuid: variables.projectUuid })
        },
    })

    return {
        removeClient: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    }
}
