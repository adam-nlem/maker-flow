import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import { httpClient } from "~/services/httpClient/httpClient"
import { clearSessionData } from "~/services/session/clearSessionData"

export function useLogout() {
    const navigate = useNavigate()

    const mutation = useMutation({
        mutationFn: async () => {
            await httpClient.get('/users/logout')
        },
        onSuccess: () => {
            clearSessionData()
            navigate('/login', { replace: true })
        },
    })

    return {
        logout: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
