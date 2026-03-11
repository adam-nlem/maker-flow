import { useQuery } from "@tanstack/react-query";
import { Onboarding } from "~/models/Onboarding";
import { httpClient } from "~/services/httpClient/httpClient";
import { onboardingQueryKeys } from "./onboardingQueryKeys";

export function useShowOnboarding({ enabled = true }: { enabled?: boolean } = {}) {
    const query = useQuery({
        queryKey: onboardingQueryKeys.show(),
        queryFn: async () => {
            const res = await httpClient.get('/onboarding');
            return Onboarding.fromJSON(res.data);
        },
        enabled,
    });

    return {
        onboarding: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error,
    };
}
