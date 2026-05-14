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
    accentColor?: string;
    backgroundColor?: string;
    backgroundSecondaryColor?: string;
    textColor?: string;
    textSecondaryColor?: string;
    headingFont?: string;
    bodyFont?: string;
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
                accentColor: data.accentColor,
                backgroundColor: data.backgroundColor,
                backgroundSecondaryColor: data.backgroundSecondaryColor,
                textColor: data.textColor,
                textSecondaryColor: data.textSecondaryColor,
                headingFont: data.headingFont,
                bodyFont: data.bodyFont,
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
