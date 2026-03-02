import { useQuery } from "@tanstack/react-query";
import { Subscription, type SubscriptionJSON } from "~/models/Subscription";
import { httpClient } from "~/services/httpClient/httpClient";
import { subscriptionQueryKeys } from "./subscriptionQueryKeys";

export function useShowCurrentSubscription() {
    const query = useQuery({
        queryKey: subscriptionQueryKeys.current(),
        queryFn: async () => {
            try {
                const res = await httpClient.get<SubscriptionJSON>('/subscriptions/current');
                return Subscription.fromJSON(res.data);
            } catch (error: any) {
                if (error?.statusCode === 404) {
                    return null;
                }
                throw error;
            }
        },
    });

    return {
        subscription: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error,
    };
}
