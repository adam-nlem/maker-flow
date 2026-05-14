import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Agency } from "~/models/Agency";
import { httpClient } from "~/services/httpClient/httpClient";
import { AnalyticsEvent } from "~/models/enums/AnalyticsEvent";
import { track } from "~/services/analytics/analytics";
import { userQueryKeys } from "~/hooks/api/users/userQueryKeys";
import { agencyQueryKeys } from "./agencyQueryKeys";

interface CreateAgencyData {
    name: string;
    accentColor: string | null;
    contactEmail: string | null;
    website: string | null;
}

export function useCreateAgency() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (data: CreateAgencyData) => {
            const res = await httpClient.post('/agencies', {
                "name": data.name,
                "accentColor": data.accentColor,
                "contactEmail": data.contactEmail,
                "website": data.website,
            })
            return Agency.fromJSON(res.data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userQueryKeys.me })
            queryClient.invalidateQueries({ queryKey: agencyQueryKeys.all })
            track(AnalyticsEvent.AgencyCreated)
        },
    })

    return {
        createAgency: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    }
}
