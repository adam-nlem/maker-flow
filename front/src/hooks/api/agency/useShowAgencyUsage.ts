import { useQuery } from "@tanstack/react-query"
import { AgencyUsageDTO, type AgencyUsageDTOJSON } from "~/dtos/agency/AgencyUsageDTO"
import { httpClient } from "~/services/httpClient/httpClient"
import { agencyQueryKeys } from "./agencyQueryKeys"

export function useShowAgencyUsage() {
    const query = useQuery({
        queryKey: agencyQueryKeys.usage(),
        queryFn: async () => {
            const res = await httpClient.get<AgencyUsageDTOJSON>('/agencies/usage')
            return AgencyUsageDTO.fromJSON(res.data)
        },
    })

    return {
        usage: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error,
    }
}
