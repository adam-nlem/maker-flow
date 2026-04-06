import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { AnalyticsEvent } from "~/models/enums/AnalyticsEvent";
import { track } from "~/services/analytics/analytics";
import { subscriptionQueryKeys } from "./subscriptionQueryKeys";

export function useCancelSubscription() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async () => {
            const res = await httpClient.post('/subscriptions/cancel');
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.current() });
            track(AnalyticsEvent.SubscriptionCancelled)
        },
    });

    return {
        cancelSubscription: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    };
}
