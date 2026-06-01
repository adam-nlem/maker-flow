import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Onboarding } from "~/models/Onboarding";
import { httpClient } from "~/services/httpClient/httpClient";
import { AnalyticsEvent } from "~/models/enums/AnalyticsEvent";
import { track } from "~/services/analytics/analytics";
import { onboardingQueryKeys } from "./onboardingQueryKeys";

export function useCompleteOnboardingStep() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (step: string) => {
            const res = await httpClient.post('/onboarding/complete-step', { step });
            return Onboarding.fromJSON(res.data);
        },
        onSuccess: (_, step) => {
            queryClient.invalidateQueries({ queryKey: onboardingQueryKeys.all });
            track(AnalyticsEvent.OnboardingStepCompleted, { step })
        },
    });

    return {
        completeStep: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    };
}
