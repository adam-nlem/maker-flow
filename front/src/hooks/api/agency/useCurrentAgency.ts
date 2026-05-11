import { useQuery } from "@tanstack/react-query"
import { Agency } from "~/models/Agency"
import { httpClient } from "~/services/httpClient/httpClient"
import { agencyQueryKeys } from "./agencyQueryKeys"

export function useCurrentAgency() {
    const query = useQuery({
        queryKey: agencyQueryKeys.current(),
        queryFn: async () => {
            const res = await httpClient.get('/agencies/current')
            return Agency.fromJSON(res.data)
        },
    })

    return {
        agency: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error,
    }
}
