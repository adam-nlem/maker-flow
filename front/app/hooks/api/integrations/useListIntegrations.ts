import { useQuery } from "@tanstack/react-query";
import { IntegrationsGroupedByProviderDTO, type IntegrationsGroupedByProviderDTOJSON } from "~/models/dtos/IntegrationsGroupedByProviderDTO";
import { httpClient } from "~/services/httpClient/httpClient";
import { integrationQueryKeys } from "./integrationQueryKeys";

interface UseListIntegrationsProps {
    userModuleUuid: string;
}

export function useListIntegrations({ userModuleUuid }: UseListIntegrationsProps) {
    const query = useQuery({
        queryKey: integrationQueryKeys.list(userModuleUuid),
        queryFn: async () => {
            const res = await httpClient.get<IntegrationsGroupedByProviderDTOJSON[]>(`/integrations`, {
                params: { userModuleUuid }
            });
            return res.data.map((json) => IntegrationsGroupedByProviderDTO.fromJSON(json));
        },
    });

    return {
        integrationsByProvider: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error,
    };
}
