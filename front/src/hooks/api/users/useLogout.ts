import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { loginPath } from "~/routes/routePaths"
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
            navigate(loginPath, { replace: true })
        },
    })

    return {
        logout: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
