import { useState } from "react";
import { useCreateSubscriptionCheckout } from "~/hooks/api/subscriptions/useCreateSubscriptionCheckout";
import type { SubscriptionPlan } from "~/models/enums/SubscriptionPlan";
import { planConfigs } from "~/models/PlanConfig";
import PlanCard from "./PlanCard";

export default function PlanSelector() {
    const { createCheckout, isPending } = useCreateSubscriptionCheckout();
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

    const handleSelect = (plan: SubscriptionPlan) => {
        setSelectedPlan(plan);
        createCheckout(plan);
    };

    return (
        <div>
            <h3 className="text-heading-md mb-4">Choisir un abonnement</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {planConfigs.map((config) => (
                    <PlanCard
                        key={config.plan}
                        config={config}
                        isPending={isPending && selectedPlan === config.plan}
                        onSelect={() => handleSelect(config.plan)}
                    />
                ))}
            </div>
        </div>
    );
}
