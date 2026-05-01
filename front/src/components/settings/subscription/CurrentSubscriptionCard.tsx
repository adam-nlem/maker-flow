import { useState } from "react";
import { CheckBadgeIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/ui/Button";
import ConfirmDeleteDialog from "~/components/ui/ConfirmDeleteDialog";
import { useCancelSubscription } from "~/hooks/api/subscriptions/useCancelSubscription";
import { useResumeSubscription } from "~/hooks/api/subscriptions/useResumeSubscription";
import type { Subscription } from "~/models/Subscription";
import { subscriptionPlanTranslationKeys } from "~/models/enums/SubscriptionPlan";
import { subscriptionStatusTranslationKeys } from "~/models/enums/SubscriptionStatus";
import { formatToFrenchDateLong } from "~/utils/dateFormatters";

interface CurrentSubscriptionCardProps {
    subscription: Subscription;
}

export default function CurrentSubscriptionCard({ subscription }: CurrentSubscriptionCardProps) {
    const { t } = useTranslation();
    const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

    const { cancelSubscription, isPending: isCanceling } = useCancelSubscription();
    const { resumeSubscription, isPending: isResuming } = useResumeSubscription();

    const handleResume = async () => {
        await resumeSubscription();
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="border border-light-gray rounded-xl p-5">
                <div className="flex flex-row items-center justify-between mb-4">
                    <h3 className="text-heading-md">{t("settings:subscription.current.title")}</h3>
                    <span className={`text-body-xs px-3 py-1 rounded-full ${subscription.isActive ? 'bg-primary/10 text-primary' : 'bg-yellow/10 text-yellow'}`}>
                        {t(subscriptionStatusTranslationKeys[subscription.status])}
                    </span>
                </div>

                <p className="text-heading-xl text-dark">
                    {t(subscriptionPlanTranslationKeys[subscription.plan])}
                </p>

                <div className="flex flex-col gap-2 mt-4">
                    <div className="flex flex-row items-center gap-2">
                        <CheckBadgeIcon className="size-4 text-gray" strokeWidth={1.5} />
                        <p className="text-body-sm text-gray">
                            {t("settings:subscription.current.period", {
                                start: formatToFrenchDateLong(subscription.currentPeriodStart),
                                end: formatToFrenchDateLong(subscription.currentPeriodEnd),
                            })}
                        </p>
                    </div>

                    {subscription.cancelAtPeriodEnd && (
                        <div className="flex flex-row items-center gap-2">
                            <ExclamationTriangleIcon className="size-4 text-yellow" strokeWidth={1.5} />
                            <p className="text-body-sm text-yellow">
                                {t("settings:subscription.current.cancellationScheduled", { date: formatToFrenchDateLong(subscription.currentPeriodEnd) })}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex flex-row gap-3 mt-5">
                    {subscription.isActive && !subscription.cancelAtPeriodEnd && (
                        <>
                            <Button
                                style="danger"
                                width="w-auto"
                                height="h-9"
                                onClick={() => setShowCancelConfirmation(true)}
                            >
                                {t("settings:subscription.current.cancel")}
                            </Button>
                            <ConfirmDeleteDialog
                                isOpen={showCancelConfirmation}
                                onClose={() => setShowCancelConfirmation(false)}
                                onConfirm={async () => {
                                    await cancelSubscription();
                                    setShowCancelConfirmation(false);
                                }}
                                isPending={isCanceling}
                                message={t("settings:subscription.current.cancelConfirm")}
                            />
                        </>
                    )}

                    {subscription.cancelAtPeriodEnd && (
                        <Button
                            style="primary"
                            width="w-auto"
                            height="h-9"
                            isLoading={isResuming}
                            onClick={handleResume}
                        >
                            {t("settings:subscription.current.resume")}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
