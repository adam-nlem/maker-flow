import { useQuery } from "@tanstack/react-query"
import { Invitation } from "~/models/Invitation"
import { httpClient } from "~/services/httpClient/httpClient"
import { invitationQueryKeys } from "./invitationQueryKeys"

export function useShowInvitation(token: string | null | undefined) {
    const query = useQuery({
        queryKey: invitationQueryKeys.show(token ?? ''),
        queryFn: async () => {
            const res = await httpClient.get(`/invitations/${token}`)
            return Invitation.fromJSON(res.data)
        },
        enabled: Boolean(token),
        retry: false,
    })

    return {
        invitation: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error,
    }
}
