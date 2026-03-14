import { useQuery } from "@tanstack/react-query";
import { Integration, type IntegrationJSON } from "~/models/Integration";
import { httpClient } from "~/services/httpClient/httpClient";
import { integrationQueryKeys } from "./integrationQueryKeys";

interface UseListIntegrationsProps {
    projectUuid: string | null;
}

export function useListIntegrations({ projectUuid }: UseListIntegrationsProps) {
    const query = useQuery({
        queryKey: integrationQueryKeys.list(projectUuid ?? ''),
        queryFn: async () => {
            const res = await httpClient.get<IntegrationJSON[]>(`/integrations`, {
                params: { projectUuid }
            });

            return res.data.map((json) => Integration.fromJSON(json));
        },
        enabled: !!projectUuid,
    });

    return {
        integrations: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error,
    };
}
