import { useQuery } from "@tanstack/react-query";
import { Subscription, type SubscriptionJSON } from "~/models/Subscription";
import { httpClient } from "~/services/httpClient/httpClient";
import { subscriptionQueryKeys } from "./subscriptionQueryKeys";

interface UseShowCurrentSubscriptionOptions {
    refetchInterval?: number | false;
}

export function useShowCurrentSubscription({ refetchInterval }: UseShowCurrentSubscriptionOptions = {}) {
    const query = useQuery({
        queryKey: subscriptionQueryKeys.current(),
        queryFn: async () => {
            const res = await httpClient.get<SubscriptionJSON | null>('/subscriptions/current');
            return res.data ? Subscription.fromJSON(res.data) : null;
        },
        ...(refetchInterval !== undefined && { refetchInterval }),
    });

    return {
        subscription: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error,
    };
}
