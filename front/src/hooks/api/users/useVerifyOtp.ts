import { useMutation, useQueryClient } from "@tanstack/react-query"
import { OtpType, otpTypeToEndpoint } from "~/models/enums/OtpType"
import { User } from "~/models/User"
import { httpClient } from "~/services/httpClient/httpClient"
import { userQueryKeys } from "./userQueryKeys"

interface VerifyOtpData {
    pendingOtpToken: string
    code: string
    purpose: OtpType
}

export function useVerifyOtp() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (data: VerifyOtpData) => {
            const res = await httpClient.post(otpTypeToEndpoint[data.purpose], {
                pendingOtpToken: data.pendingOtpToken,
                code: data.code,
            })

            return User.fromJSON(res.data)
        },
        onSuccess: (user) => {
            queryClient.setQueryData(userQueryKeys.me, user)
        },
    })

    return {
        verifyOtp: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    }
}
