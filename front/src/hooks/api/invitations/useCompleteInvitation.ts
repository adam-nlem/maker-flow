import { useMutation, useQueryClient } from "@tanstack/react-query"
import { User } from "~/models/User"
import { httpClient } from "~/services/httpClient/httpClient"
import { userQueryKeys } from "~/hooks/api/users/userQueryKeys"
import { AnalyticsEvent } from "~/models/enums/AnalyticsEvent"
import { identifyUser, track } from "~/services/analytics/analytics"

interface CompleteInvitationData {
    token: string;
    password: string;
}

export function useCompleteInvitation() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async ({ token, password }: CompleteInvitationData) => {
            const res = await httpClient.post(`/invitations/${token}/complete`, { password })
            return User.fromJSON(res.data)
        },
        onSuccess: async (user) => {
            queryClient.setQueryData(userQueryKeys.me, user)
            await queryClient.invalidateQueries({ queryKey: userQueryKeys.me })
            identifyUser({ uuid: user.uuid, role: user.displayRole })
            track(user.isClient ? AnalyticsEvent.ClientSetupCompleted : AnalyticsEvent.CollaboratorSetupCompleted)
        },
    })

    return {
        completeInvitation: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    }
}
