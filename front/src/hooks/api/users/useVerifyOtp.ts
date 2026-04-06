import { useMutation, useQueryClient } from "@tanstack/react-query"
import { OtpType, otpTypeToEndpoint } from "~/models/enums/OtpType"
import { User } from "~/models/User"
import { httpClient } from "~/services/httpClient/httpClient"
import { AnalyticsEvent } from "~/models/enums/AnalyticsEvent"
import { identifyUser, track } from "~/services/analytics/analytics"
import { userQueryKeys } from "./userQueryKeys"

interface VerifyOtpData {
    pendingOtpToken: string
    code: string
    type: OtpType
}

export function useVerifyOtp() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (data: VerifyOtpData) => {
            const res = await httpClient.post(otpTypeToEndpoint[data.type], {
                pendingOtpToken: data.pendingOtpToken,
                code: data.code,
            })

            return User.fromJSON(res.data)
        },
        onSuccess: (user, data) => {
            queryClient.setQueryData(userQueryKeys.me, user)
            identifyUser({ uuid: user.uuid, email: user.email })
            track(AnalyticsEvent.UserLoggedIn, { method: data.type })
        },
    })

    return {
        verifyOtp: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    }
}
