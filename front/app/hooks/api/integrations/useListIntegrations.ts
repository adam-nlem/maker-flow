import { useQuery } from "@tanstack/react-query";
import { Integration, type IntegrationJSON } from "~/models/Integration";
import { httpClient } from "~/services/httpClient/httpClient";
import { integrationQueryKeys } from "./integrationQueryKeys";

interface UseListIntegrationsProps {
    userModuleUuid: string;
}

export function useListIntegrations({ userModuleUuid }: UseListIntegrationsProps) {
    const query = useQuery({
        queryKey: integrationQueryKeys.list(userModuleUuid),
        queryFn: async () => {
            const res = await httpClient.get<IntegrationJSON[]>(`/integrations`, {
                params: { userModuleUuid }
            });
            return res.data.map((json) => Integration.fromJSON(json));
        },
    });

    return {
        integrations: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error,
    };
}
