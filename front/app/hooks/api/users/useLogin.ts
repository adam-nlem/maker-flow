import { useMutation, useQueryClient } from "@tanstack/react-query"
import { User } from "~/models/User"
import { httpClient } from "~/services/httpClient/httpClient"
import { userQueryKeys } from "./userQueryKeys"

interface LoginData {
    email: string
    password: string
}

export function useLogin() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (data: LoginData) => {
            const res = await httpClient.post('/login', {
                email: data.email,
                password: data.password
            })
            return User.fromJSON(res.data)
        },
        onSuccess: (user) => {
            queryClient.setQueryData(userQueryKeys.me, user)
        },
    })

    return {
        login: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    }
}
