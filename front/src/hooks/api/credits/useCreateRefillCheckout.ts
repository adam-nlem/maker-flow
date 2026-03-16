import { useMutation } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";

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
            window.location.href = data.checkout_url;
        },
    });

    return {
        createRefillCheckout: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    };
}
