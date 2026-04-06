import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Onboarding } from "~/models/Onboarding";
import { httpClient } from "~/services/httpClient/httpClient";
import { AnalyticsEvent } from "~/models/enums/AnalyticsEvent";
import { track } from "~/services/analytics/analytics";
import { onboardingQueryKeys } from "./onboardingQueryKeys";

export function useDismissOnboarding() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async () => {
            const res = await httpClient.post('/onboarding/dismiss');
            return Onboarding.fromJSON(res.data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: onboardingQueryKeys.all });
            track(AnalyticsEvent.OnboardingDismissed)
        },
    });

    return {
        dismiss: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    };
}
