import { useMutation } from "@tanstack/react-query"
import { LoginResponseDTO } from "~/models/dtos/LoginResponseDTO"
import { httpClient } from "~/services/httpClient/httpClient"

interface LoginData {
    email: string
    password: string
}

export function useLogin() {
    const mutation = useMutation({
        mutationFn: async (data: LoginData): Promise<LoginResponseDTO> => {
            const res = await httpClient.post('/login', {
                email: data.email,
                password: data.password
            })
            return LoginResponseDTO.fromJSON(res.data)
        },
    })

    return {
        login: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    }
}
