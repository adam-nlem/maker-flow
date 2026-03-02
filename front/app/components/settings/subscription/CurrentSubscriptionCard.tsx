import { CheckBadgeIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import type { Subscription } from "~/models/Subscription";
import { subscriptionPlanToFrenchTranslation } from "~/models/enums/SubscriptionPlan";
import { subscriptionStatusToFrenchTranslation } from "~/models/enums/SubscriptionStatus";
import { formatToFrenchDateLong } from "~/utils/dateFormatters";

interface CurrentSubscriptionCardProps {
    subscription: Subscription;
}

export default function CurrentSubscriptionCard({ subscription }: CurrentSubscriptionCardProps) {
    return (
        <div className="border border-light-gray rounded-xl p-5">
            <div className="flex flex-row items-center justify-between mb-4">
                <h3 className="text-heading-md">Abonnement actuel</h3>
                <span className={`text-body-xs px-3 py-1 rounded-full ${subscription.isActive ? 'bg-primary/10 text-primary' : 'bg-yellow/10 text-yellow'}`}>
                    {subscriptionStatusToFrenchTranslation[subscription.status]}
                </span>
            </div>

            <p className="text-heading-xl text-dark">
                {subscriptionPlanToFrenchTranslation[subscription.plan]}
            </p>

            <div className="flex flex-col gap-2 mt-4">
                <div className="flex flex-row items-center gap-2">
                    <CheckBadgeIcon className="size-4 text-gray" strokeWidth={1.5} />
                    <p className="text-body-sm text-gray">
                        Période : {formatToFrenchDateLong(subscription.currentPeriodStart)} — {formatToFrenchDateLong(subscription.currentPeriodEnd)}
                    </p>
                </div>

                {subscription.cancelAtPeriodEnd && (
                    <div className="flex flex-row items-center gap-2">
                        <ExclamationTriangleIcon className="size-4 text-yellow" strokeWidth={1.5} />
                        <p className="text-body-sm text-yellow">
                            Annulation prévue le {formatToFrenchDateLong(subscription.currentPeriodEnd)}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
