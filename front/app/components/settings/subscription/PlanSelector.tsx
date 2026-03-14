import { useState } from "react";
import { useCreateSubscriptionCheckout } from "~/hooks/api/subscriptions/useCreateSubscriptionCheckout";
import { useListPlans } from "~/hooks/api/subscriptions/useListPlans";
import type { SubscriptionPlan } from "~/models/enums/SubscriptionPlan";
import PlanCard from "./PlanCard";
import Shimmer from "~/components/ui/Shimmer";

interface PlanSelectorProps {
    checkoutRedirectPath?: string;
    disabledPlan?: SubscriptionPlan;
}

export default function PlanSelector({ checkoutRedirectPath, disabledPlan }: PlanSelectorProps) {
    const { createCheckout, isPending } = useCreateSubscriptionCheckout();
    const { plans, isLoading, error } = useListPlans();
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

    const handleSelect = (plan: SubscriptionPlan) => {
        setSelectedPlan(plan);
        createCheckout({ plan, checkoutRedirectPath });
    };

    if (error) {
        return (
            <div>
                <h3 className="text-heading-md mb-4">Choisir un abonnement</h3>
                <p className="text-body-sm text-gray">Impossible de charger les abonnements. Veuillez réessayer plus tard.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div>
                <h3 className="text-heading-md mb-4">Choisir un abonnement</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Shimmer key={i} height="h-64" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-heading-md mb-4">Choisir un abonnement</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((config) => (
                    <PlanCard
                        key={config.plan}
                        config={config}
                        isPending={isPending && selectedPlan === config.plan}
                        disabled={config.plan === disabledPlan}
                        onSelect={() => handleSelect(config.plan)}
                    />
                ))}
            </div>
        </div>
    );
}
