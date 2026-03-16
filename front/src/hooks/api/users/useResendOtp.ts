import { useMutation } from "@tanstack/react-query"
import { ResendOtpResponseDTO } from "~/models/dtos/ResendOtpResponseDTO"
import { httpClient } from "~/services/httpClient/httpClient"

interface ResendOtpData {
    pendingOtpToken: string
}

export function useResendOtp() {
    const mutation = useMutation({
        mutationFn: async (data: ResendOtpData): Promise<ResendOtpResponseDTO> => {
            const res = await httpClient.post('/otp/resend', {
                pendingOtpToken: data.pendingOtpToken,
            })

            return ResendOtpResponseDTO.fromJSON(res.data)
        },
    })

    return {
        resendOtp: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    }
}
