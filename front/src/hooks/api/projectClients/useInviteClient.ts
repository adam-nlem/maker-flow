import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Invitation } from "~/models/Invitation"
import { InvitationType } from "~/models/enums/InvitationType"
import { httpClient } from "~/services/httpClient/httpClient"
import { AnalyticsEvent } from "~/models/enums/AnalyticsEvent"
import { track } from "~/services/analytics/analytics"
import { projectClientQueryKeys } from "./projectClientQueryKeys"

interface InviteClientData {
    projectUuid: string;
    firstName: string;
    lastName: string;
    email: string;
}

export function useInviteClient() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (data: InviteClientData) => {
            const res = await httpClient.post('/invitations', {
                type: InvitationType.Client,
                projectUuid: data.projectUuid,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
            })
            return Invitation.fromJSON(res.data)
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: projectClientQueryKeys.list(variables.projectUuid) })
            track(AnalyticsEvent.ClientInvited, { project_uuid: variables.projectUuid })
        },
    })

    return {
        inviteClient: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    }
}
