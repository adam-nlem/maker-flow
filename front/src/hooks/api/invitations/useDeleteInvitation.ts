import { useMutation, useQueryClient } from "@tanstack/react-query"
import { httpClient } from "~/services/httpClient/httpClient"
import { AnalyticsEvent } from "~/models/enums/AnalyticsEvent"
import { track } from "~/services/analytics/analytics"
import { agencyQueryKeys } from "~/hooks/api/agency/agencyQueryKeys"
import { collaboratorQueryKeys } from "~/hooks/api/collaborators/collaboratorQueryKeys"
import { projectClientQueryKeys } from "~/hooks/api/projectClients/projectClientQueryKeys"

export function useDeleteInvitation() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (invitationUuid: string) => {
            await httpClient.delete(`/invitations/${invitationUuid}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: collaboratorQueryKeys.all })
            queryClient.invalidateQueries({ queryKey: projectClientQueryKeys.all })
            queryClient.invalidateQueries({ queryKey: agencyQueryKeys.usage() })
            track(AnalyticsEvent.InvitationDeleted)
        },
    })

    return {
        deleteInvitation: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    }
}
