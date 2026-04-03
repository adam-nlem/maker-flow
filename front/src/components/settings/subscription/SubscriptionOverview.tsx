import { useEffect, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { useShowCurrentSubscription } from "~/hooks/api/subscriptions/useShowCurrentSubscription";
import { ToastType } from "~/models/enums/ToastType";
import { useToastStore } from "~/stores/toast/toastStore";
import { AnalyticsEvent } from "~/models/enums/AnalyticsEvent";
import { track } from "~/services/analytics/analytics";
import type { Subscription } from "~/models/Subscription";
import Shimmer from "~/components/ui/Shimmer";
import CurrentSubscriptionCard from "./CurrentSubscriptionCard";
import PlanSelector from "./PlanSelector";

interface SubscriptionOverviewProps {
    checkoutRedirectPath?: string;
    subscribedView?: (subscription: Subscription) => ReactNode;
    loadingView?: ReactNode;
}

export default function SubscriptionOverview({ checkoutRedirectPath, subscribedView, loadingView }: SubscriptionOverviewProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const isCheckoutSuccess = searchParams.get("checkout") === "success";

    const { subscription, isLoading } = useShowCurrentSubscription({
        refetchInterval: isCheckoutSuccess ? 2000 : false,
    });

    useEffect(() => {
        if (isCheckoutSuccess && subscription) {
            track(AnalyticsEvent.SubscriptionPurchased, { plan: subscription.plan })
            useToastStore.getState().addToast(ToastType.Success, "Paiement effectué avec succès");
            setSearchParams({}, { replace: true });
        }
    }, [isCheckoutSuccess, subscription, setSearchParams]);

    if (isLoading) {
        return loadingView ?? (
            <div className="border border-light-gray rounded-xl p-5 flex flex-col gap-3">
                <Shimmer width="w-40" height="h-5" />
                <Shimmer width="w-24" height="h-8" radius="rounded-md" />
                <Shimmer width="w-64" height="h-4" />
            </div>
        );
    }

    if (subscription) {
        return subscribedView
            ? subscribedView(subscription)
            : <CurrentSubscriptionCard subscription={subscription} />;
    }

    return <PlanSelector checkoutRedirectPath={checkoutRedirectPath} />;
}
