import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Invitation } from "~/models/Invitation"
import { InvitationType } from "~/models/enums/InvitationType"
import { UserRole } from "~/models/enums/UserRole"
import { httpClient } from "~/services/httpClient/httpClient"
import { AnalyticsEvent } from "~/models/enums/AnalyticsEvent"
import { track } from "~/services/analytics/analytics"
import { agencyQueryKeys } from "~/hooks/api/agency/agencyQueryKeys"
import { collaboratorQueryKeys } from "./collaboratorQueryKeys"

interface InviteCollaboratorData {
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
}

export function useInviteCollaborator() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (data: InviteCollaboratorData) => {
            const res = await httpClient.post('/invitations', {
                type: InvitationType.Collaborator,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                role: data.role,
            })
            return Invitation.fromJSON(res.data)
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: collaboratorQueryKeys.all })
            queryClient.invalidateQueries({ queryKey: agencyQueryKeys.usage() })
            track(AnalyticsEvent.CollaboratorInvited, { role: variables.role })
        },
    })

    return {
        inviteCollaborator: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    }
}
