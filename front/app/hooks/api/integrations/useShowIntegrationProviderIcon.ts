import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { integrationQueryKeys } from "./integrationQueryKeys";

export function useShowIntegrationProviderIcon(provider?: string) {
    const query = useQuery({
        queryKey: integrationQueryKeys.providerIcon(provider ?? ''),
        queryFn: async () => {
            const res = await httpClient.get(`/integrations/providers/${provider}/icon`, {
                responseType: 'blob'
            });
            return URL.createObjectURL(res.data);
        },
        enabled: !!provider,
        staleTime: Infinity,
    });

    return {
        iconUrl: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error,
    };
}
