import { useMutation } from "@tanstack/react-query";
import type { SubscriptionPlan } from "~/models/enums/SubscriptionPlan";
import { httpClient } from "~/services/httpClient/httpClient";

interface CreateSubscriptionCheckoutResponse {
    checkout_url: string;
}

interface CreateSubscriptionCheckoutParams {
    plan: SubscriptionPlan;
    checkoutRedirectPath?: string;
}

export function useCreateSubscriptionCheckout() {
    const mutation = useMutation({
        mutationFn: async ({ plan, checkoutRedirectPath }: CreateSubscriptionCheckoutParams) => {
            const res = await httpClient.post<CreateSubscriptionCheckoutResponse>('/subscriptions/checkout', {
                plan,
                checkoutRedirectPath,
            });
            return res.data;
        },
        onSuccess: (data) => {
            window.location.href = data.checkout_url;
        },
    });

    return {
        createCheckout: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    };
}
