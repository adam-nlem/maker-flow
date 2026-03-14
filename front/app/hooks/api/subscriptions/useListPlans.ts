import { useQuery } from "@tanstack/react-query";
import { PlanConfigDTO, type PlanConfigDTOJSON } from "~/dtos/subscriptions/PlanConfigDTO";
import { httpClient } from "~/services/httpClient/httpClient";
import { subscriptionQueryKeys } from "./subscriptionQueryKeys";

export function useListPlans() {
    const query = useQuery({
        queryKey: subscriptionQueryKeys.plans(),
        queryFn: async () => {
            const res = await httpClient.get<PlanConfigDTOJSON[]>('/subscriptions/plans');
            return res.data.map(PlanConfigDTO.fromJSON);
        },
        staleTime: 1000 * 60 * 30,
    });

    return {
        plans: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error,
    };
}
