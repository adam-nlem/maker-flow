import { useMutation } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";

interface CreateTopupCheckoutResponse {
    checkout_url: string;
}

export function useCreateTopupCheckout() {
    const mutation = useMutation({
        mutationFn: async () => {
            const res = await httpClient.post<CreateTopupCheckoutResponse>('/credits/topup/checkout');
            return res.data;
        },
        onSuccess: (data) => {
            window.location.href = data.checkout_url;
        },
    });

    return {
        createTopupCheckout: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    };
}
