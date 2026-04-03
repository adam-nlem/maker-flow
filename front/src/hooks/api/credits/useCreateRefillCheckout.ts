import { useMutation } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { AnalyticsEvent } from "~/models/enums/AnalyticsEvent";
import { track } from "~/services/analytics/analytics";

interface CreateRefillCheckoutResponse {
    checkout_url: string;
}

export function useCreateRefillCheckout() {
    const mutation = useMutation({
        mutationFn: async () => {
            const res = await httpClient.post<CreateRefillCheckoutResponse>('/credits/refill/checkout');
            return res.data;
        },
        onSuccess: (data) => {
            track(AnalyticsEvent.CreditRefillCheckoutStarted)
            window.location.href = data.checkout_url;
        },
    });

    return {
        createRefillCheckout: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    };
}
