import { useMutation, useQueryClient } from "@tanstack/react-query"
import { User } from "~/models/User"
import { httpClient } from "~/services/httpClient/httpClient"
import { userQueryKeys } from "~/hooks/api/users/userQueryKeys"

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
        },
    })

    return {
        completeInvitation: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    }
}
