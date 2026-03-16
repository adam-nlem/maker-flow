import { useQuery } from "@tanstack/react-query";
import { CreditBalance, type CreditBalanceJSON } from "~/models/CreditBalance";
import { httpClient } from "~/services/httpClient/httpClient";
import { creditQueryKeys } from "./creditQueryKeys";

export function useShowCreditBalance() {
    const query = useQuery({
        queryKey: creditQueryKeys.balance(),
        queryFn: async () => {
            const res = await httpClient.get<CreditBalanceJSON>('/credits/balance');
            return CreditBalance.fromJSON(res.data);
        },
    });

    return {
        creditBalance: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error,
    };
}
