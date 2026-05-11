import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Agency } from "~/models/Agency"
import { httpClient } from "~/services/httpClient/httpClient"
import { AnalyticsEvent } from "~/models/enums/AnalyticsEvent"
import { track } from "~/services/analytics/analytics"
import { userQueryKeys } from "~/hooks/api/users/userQueryKeys"
import { agencyQueryKeys } from "./agencyQueryKeys"

interface UpdateAgencyData {
    agencyUuid: string;
    name?: string;
    brandColor?: string;
    contactEmail?: string;
    website?: string;
}

export function useUpdateAgency() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (data: UpdateAgencyData) => {
            const res = await httpClient.patch('/agencies', {
                agencyUuid: data.agencyUuid,
                name: data.name,
                brandColor: data.brandColor,
                contactEmail: data.contactEmail,
                website: data.website,
            })
            return Agency.fromJSON(res.data)
        },
        onSuccess: (agency) => {
            queryClient.setQueryData(agencyQueryKeys.current(), agency)
            queryClient.invalidateQueries({ queryKey: agencyQueryKeys.all })
            queryClient.invalidateQueries({ queryKey: userQueryKeys.me })
            track(AnalyticsEvent.AgencySettingsUpdated)
        },
    })

    return {
        updateAgency: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    }
}
