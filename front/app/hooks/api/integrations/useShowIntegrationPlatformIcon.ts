import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { integrationQueryKeys } from "./integrationQueryKeys";

export function useShowIntegrationPlatformIcon(platform?: string) {
    const [iconUrl, setIconUrl] = useState<string | null>(null);

    const query = useQuery({
        queryKey: integrationQueryKeys.platformIcon(platform ?? ''),
        queryFn: async () => {
            const res = await httpClient.get(`/integrations/platforms/${platform}/icon`, {
                responseType: 'blob'
            });
            return res.data as Blob;
        },
        enabled: !!platform,
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
