import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Agency } from "~/models/Agency"
import { httpClient } from "~/services/httpClient/httpClient"
import { AnalyticsEvent } from "~/models/enums/AnalyticsEvent"
import { track } from "~/services/analytics/analytics"
import { userQueryKeys } from "~/hooks/api/users/userQueryKeys"
import { agencyQueryKeys } from "./agencyQueryKeys"
import { useState } from "react"
import { validateAgencyUpdate } from "~/utils/agencyValidation"

interface UpdateAgencyData {
  agencyUuid: string;
  name?: string;
  contactEmail?: string;
  website?: string;
  logo?: File;
}

export function useUpdateAgency() {
  const queryClient = useQueryClient()
  const [validationErrorKey, setValidationErrorKey] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (data: UpdateAgencyData) => {
      const formData = new FormData();
      formData.append("agencyUuid", data.agencyUuid);
      data.name && formData.append("name", data.name);
      data.contactEmail && formData.append("contactEmail", data.contactEmail);
      data.website && formData.append("website", data.website);
      data.logo && formData.append("logo", data.logo);

      const res = await httpClient.patch('/agencies', formData)
      return Agency.fromJSON(res.data)
    },
    onSuccess: (agency) => {
      queryClient.setQueryData(agencyQueryKeys.current(), agency)
      queryClient.invalidateQueries({ queryKey: agencyQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: userQueryKeys.me })
      queryClient.invalidateQueries({ queryKey: agencyQueryKeys.logo(agency.uuid) });
      track(AnalyticsEvent.AgencySettingsUpdated)
    },
  });

  const updateAgency = async (data: UpdateAgencyData): Promise<Agency | undefined> => {
    const error = validateAgencyUpdate(data)
    if (error) {
      setValidationErrorKey(error)
      return;
    }

    setValidationErrorKey(null);
    await mutation.mutateAsync(data);
  }

  const clearValidationError = () => setValidationErrorKey(null);

  return {
    updateAgency,
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
    validationErrorKey,
    clearValidationError,
  }
}
