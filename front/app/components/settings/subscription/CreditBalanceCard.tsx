import { CreditCardIcon } from "@heroicons/react/24/outline";
import { Button } from "~/components/ui/Button";
import Shimmer from "~/components/ui/Shimmer";
import { useShowCreditBalance } from "~/hooks/api/credits/useShowCreditBalance";
import { useCreateTopupCheckout } from "~/hooks/api/credits/useCreateTopupCheckout";

export default function CreditBalanceCard() {
    const { creditBalance, isLoading } = useShowCreditBalance();
    const { createTopupCheckout, isPending: isTopupPending } = useCreateTopupCheckout();
    if (isLoading) {
        return (
            <div className="border border-light-gray rounded-xl p-5">
                <Shimmer width="w-32" height="h-5" />
                <Shimmer width="w-20" height="h-8" radius="rounded-md" />
                <div className="flex flex-row gap-6 mt-3">
                    <Shimmer width="w-40" height="h-4" />
                    <Shimmer width="w-40" height="h-4" />
                </div>
            </div>
        );
    }

    if (!creditBalance) return null;

    return (
        <div className="border border-light-gray rounded-xl p-5">
            <div className="flex flex-row items-center justify-between mb-3">
                <div className="flex flex-row items-center gap-2">
                    <CreditCardIcon className="size-5 text-gray" strokeWidth={1.5} />
                    <h3 className="text-heading-md">Crédits</h3>
                </div>
                <Button
                    style="outline"
                    width="w-auto"
                    height="h-8"
                    isLoading={isTopupPending}
                    onClick={() => createTopupCheckout()}
                >
                    Recharger
                </Button>
            </div>

            <p className="text-heading-2xl text-primary">{creditBalance.totalCredits}</p>

            <div className="flex flex-row gap-6 mt-3">
                <div className="flex flex-col">
                    <p className="text-body-xs text-gray">Crédits abonnement</p>
                    <p className="text-heading-sm">{creditBalance.subscriptionCredits}</p>
                </div>
                <div className="flex flex-col">
                    <p className="text-body-xs text-gray">Crédits supplémentaires</p>
                    <p className="text-heading-sm">{creditBalance.topupCredits}</p>
                </div>
            </div>
        </div>
    );
}
