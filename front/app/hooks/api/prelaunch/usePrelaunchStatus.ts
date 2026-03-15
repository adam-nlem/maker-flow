import { useQuery } from "@tanstack/react-query"
import { PrelaunchStatusResponseDTO } from "~/models/dtos/PrelaunchStatusResponseDTO"
import { httpClient } from "~/services/httpClient/httpClient"
import { prelaunchQueryKeys } from "./prelaunchQueryKeys"

export function usePrelaunchStatus(referralCode: string | null) {
    const query = useQuery({
        queryKey: prelaunchQueryKeys.status(referralCode ?? ''),
        queryFn: async () => {
            const res = await httpClient.get(`/prelaunch/status/${referralCode}`)
            return PrelaunchStatusResponseDTO.fromJSON(res.data)
        },
        enabled: referralCode !== null,
        refetchOnWindowFocus: true,
    })

    return {
        status: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    }
}
