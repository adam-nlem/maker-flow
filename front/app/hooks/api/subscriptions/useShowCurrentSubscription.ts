import { useQuery } from "@tanstack/react-query";
import { Subscription, type SubscriptionJSON } from "~/models/Subscription";
import { httpClient } from "~/services/httpClient/httpClient";
import { subscriptionQueryKeys } from "./subscriptionQueryKeys";

export function useShowCurrentSubscription() {
    const query = useQuery({
        queryKey: subscriptionQueryKeys.current(),
        queryFn: async () => {
            const res = await httpClient.get<SubscriptionJSON | null>('/subscriptions/current');
            return res.data ? Subscription.fromJSON(res.data) : null;
        },
    });

    return {
        subscription: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error,
    };
}
