import { useShowCurrentSubscription } from "~/hooks/api/subscriptions/useShowCurrentSubscription";

export function useIsSubscribed(): { isSubscribed: boolean; isLoading: boolean } {
    const { subscription, isLoading } = useShowCurrentSubscription();
    const isSubscribed = !!subscription;

    return { isSubscribed, isLoading };
}
