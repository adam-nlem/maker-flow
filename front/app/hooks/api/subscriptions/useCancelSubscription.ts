import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
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
        },
    });

    return {
        cancelSubscription: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    };
}
