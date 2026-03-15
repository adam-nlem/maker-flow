import { useMutation } from "@tanstack/react-query"
import { AuthenticatePrelaunchResponseDTO } from "~/models/dtos/AuthenticatePrelaunchResponseDTO"
import { httpClient } from "~/services/httpClient/httpClient"

interface AuthenticatePrelaunchData {
    email: string
    referralCode?: string | null
}

export function useAuthenticatePrelaunch() {
    const mutation = useMutation({
        mutationFn: async (data: AuthenticatePrelaunchData): Promise<AuthenticatePrelaunchResponseDTO> => {
            const res = await httpClient.post('/prelaunch/authenticate', {
                email: data.email,
                referralCode: data.referralCode ?? undefined,
            })
            return AuthenticatePrelaunchResponseDTO.fromJSON(res.data)
        },
    })

    return {
        authenticatePrelaunch: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    }
}
