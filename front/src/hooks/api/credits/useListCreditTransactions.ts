import { useQuery } from "@tanstack/react-query";
import { CreditTransaction, type CreditTransactionJSON } from "~/models/CreditTransaction";
import { httpClient } from "~/services/httpClient/httpClient";
import { creditQueryKeys } from "./creditQueryKeys";

export function useListCreditTransactions(page: number = 1, limit: number = 10) {
    const query = useQuery({
        queryKey: creditQueryKeys.transactions(page, limit),
        queryFn: async () => {
            const res = await httpClient.get<CreditTransactionJSON[]>('/credits/transactions', {
                params: { page, limit },
            });
            return res.data.map(CreditTransaction.fromJSON);
        },
    });

    return {
        transactions: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error,
    };
}
