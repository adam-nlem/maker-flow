import { useMutation } from "@tanstack/react-query"
import { RegisterResponseDTO } from "~/models/dtos/RegisterResponseDTO"
import { httpClient } from "~/services/httpClient/httpClient"

interface RegisterData {
    firstName: string
    lastName: string
    email: string
    password: string
}

export function useRegister() {
    const mutation = useMutation({
        mutationFn: async (data: RegisterData): Promise<RegisterResponseDTO> => {
            const res = await httpClient.post('/users/register', {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                password: data.password
            })
            return RegisterResponseDTO.fromJSON(res.data)
        },
    })

    return {
        register: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    }
}
