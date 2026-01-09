import { useMutation, useQueryClient } from "@tanstack/react-query"
import { httpClient } from "~/services/httpClient/httpClient"
import { userQueryKeys } from "./userQueryKeys"

export function useLogout() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async () => {
            await httpClient.get('/logout')
        },
        onSuccess: () => {
            queryClient.setQueryData(userQueryKeys.me, null)
        },
    })

    return {
        logout: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
