import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { useShowCreditBalance } from "~/hooks/api/credits/useShowCreditBalance";
import { useShowCurrentSubscription } from "~/hooks/api/subscriptions/useShowCurrentSubscription";
import { SettingsSection, settingsSectionToFrenchTranslation } from "~/models/enums/SettingsSection";
import { useToastStore } from "~/stores/toast/toastStore";
import Shimmer from "~/components/ui/Shimmer";
import CreditBalanceCard from "./subscription/CreditBalanceCard";
import CurrentSubscriptionCard from "./subscription/CurrentSubscriptionCard";
import PlanSelector from "./subscription/PlanSelector";

export default function SubscriptionSettings() {
    const [searchParams, setSearchParams] = useSearchParams();

    const { subscription, isLoading } = useShowCurrentSubscription();

    useEffect(() => {
        const checkout = searchParams.get("checkout");
        if (checkout === "success") {
            useToastStore.getState().addToast("success", "Paiement effectué avec succès");
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-light-gray flex flex-col gap-1">
                <h2 className="text-heading-xl">{settingsSectionToFrenchTranslation[SettingsSection.Subscription]}</h2>
                <p className="text-body-sm text-gray">Gérez votre abonnement et vos crédits.</p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
                <CreditBalanceCard />

                {isLoading ? (
                    <div className="border border-light-gray rounded-xl p-5 flex flex-col gap-3">
                        <Shimmer width="w-40" height="h-5" />
                        <Shimmer width="w-24" height="h-8" radius="rounded-md" />
                        <Shimmer width="w-64" height="h-4" />
                    </div>
                ) : subscription ? (
                    <CurrentSubscriptionCard subscription={subscription} />
                ) : (
                    <PlanSelector />
                )}
            </div>
        </div>
    );
}
