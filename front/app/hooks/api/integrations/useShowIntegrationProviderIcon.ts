import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { integrationQueryKeys } from "./integrationQueryKeys";

export function useShowIntegrationProviderIcon(provider?: string) {
    const [iconUrl, setIconUrl] = useState<string | null>(null);

    const query = useQuery({
        queryKey: integrationQueryKeys.providerIcon(provider ?? ''),
        queryFn: async () => {
            const res = await httpClient.get(`/integrations/providers/${provider}/icon`, {
                responseType: 'blob'
            });
            return res.data as Blob;
        },
        enabled: !!provider,
        staleTime: Infinity,
    });

    useEffect(() => {
        if (!query.data) {
            setIconUrl(null);
            return;
        }

        const url = URL.createObjectURL(query.data);
        setIconUrl(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [query.data]);

    return {
        iconUrl,
        isLoading: query.isLoading,
        error: query.error,
    };
}
