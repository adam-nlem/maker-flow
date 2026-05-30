import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Agency } from "~/models/Agency";
import { httpClient } from "~/services/httpClient/httpClient";
import { AnalyticsEvent } from "~/models/enums/AnalyticsEvent";
import { track } from "~/services/analytics/analytics";
import { userQueryKeys } from "~/hooks/api/users/userQueryKeys";
import { validateLogo } from "~/utils/logoValidation";
import { agencyQueryKeys } from "./agencyQueryKeys";

interface CreateAgencyData {
  name: string;
  logo: File | null;
}

export function useCreateAgency() {
  const queryClient = useQueryClient();
  const [validationErrorKey, setValidationErrorKey] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (data: { name: string; logo: File }) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("logo", data.logo);

      const res = await httpClient.post("/agencies", formData,);
      return Agency.fromJSON(res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.me });
      queryClient.invalidateQueries({ queryKey: agencyQueryKeys.all });
      track(AnalyticsEvent.AgencyCreated);
    },
  });

  const createAgency = async ({ name, logo }: CreateAgencyData): Promise<Agency | undefined> => {
    if (!name.trim()) {
      setValidationErrorKey("agencySettings:validation.nameRequired");
      return;
    }

    const logoError = validateLogo(logo);
    if (logoError || !logo) {
      setValidationErrorKey(logoError);
      return;
    }

    setValidationErrorKey(null);
    return mutation.mutateAsync({ name: name.trim(), logo });
  };

  const clearValidationError = () => setValidationErrorKey(null);

  return {
    createAgency,
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
    validationErrorKey,
    clearValidationError,
  };
}
