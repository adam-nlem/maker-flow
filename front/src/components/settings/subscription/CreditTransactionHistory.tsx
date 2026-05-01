import { useState } from "react";
import { ClockIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/ui/Button";
import Shimmer from "~/components/ui/Shimmer";
import { useListCreditTransactions } from "~/hooks/api/credits/useListCreditTransactions";
import { creditTransactionTypeTranslationKeys } from "~/models/enums/CreditTransactionType";
import { formatToFrenchDateShort } from "~/utils/dateFormatters";

const LIMIT = 10;

export default function CreditTransactionHistory() {
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const { transactions, isLoading } = useListCreditTransactions(page, LIMIT);

    if (isLoading) {
        return (
            <div className="border border-light-gray rounded-xl p-5 flex flex-col gap-3">
                <Shimmer width="w-40" height="h-5" />
                <Shimmer width="w-full" height="h-10" />
                <Shimmer width="w-full" height="h-10" />
                <Shimmer width="w-full" height="h-10" />
            </div>
        );
    }

    if (transactions.length === 0 && page === 1) return null;

    return (
        <div className="border border-light-gray rounded-xl p-5">
            <div className="flex flex-row items-center gap-2 mb-4">
                <ClockIcon className="size-5 text-gray" strokeWidth={1.5} />
                <h3 className="text-heading-md">{t("settings:subscription.history.title")}</h3>
            </div>

            <div className="flex flex-col divide-y divide-light-gray">
                {transactions.map((transaction) => (
                    <div key={transaction.uuid} className="flex flex-row items-center justify-between py-3 first:pt-0 last:pb-0">
                        <div className="flex flex-col gap-0.5">
                            <p className="text-body-sm">
                                {t(creditTransactionTypeTranslationKeys[transaction.type])}
                            </p>
                            <p className="text-body-xs text-gray">
                                {formatToFrenchDateShort(transaction.createdAt)}
                                {transaction.description && ` — ${transaction.description}`}
                            </p>
                        </div>

                        <span className={`text-heading-sm ${transaction.isCredit ? 'text-primary' : 'text-danger'}`}>
                            {transaction.isCredit ? '+' : ''}{transaction.amount}
                        </span>
                    </div>
                ))}
            </div>

            <div className="flex flex-row items-center justify-between mt-4">
                <Button
                    style="secondary"
                    width="w-auto"
                    height="h-8"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                >
                    {t("settings:subscription.history.previous")}
                </Button>

                <p className="text-body-xs text-gray">{t("settings:subscription.history.page", { page })}</p>

                <Button
                    style="secondary"
                    width="w-auto"
                    height="h-8"
                    disabled={transactions.length < LIMIT}
                    onClick={() => setPage(page + 1)}
                >
                    {t("settings:subscription.history.next")}
                </Button>
            </div>
        </div>
    );
}
