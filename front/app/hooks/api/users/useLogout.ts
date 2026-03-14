import { useMutation } from "@tanstack/react-query"
import { httpClient } from "~/services/httpClient/httpClient"
import { clearSessionData } from "~/services/session/clearSessionData"

export function useLogout() {
    const mutation = useMutation({
        mutationFn: async () => {
            await httpClient.get('/users/logout')
        },
        onSuccess: () => {
            clearSessionData()
            window.location.href = '/login'
        },
    })

    return {
        logout: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
