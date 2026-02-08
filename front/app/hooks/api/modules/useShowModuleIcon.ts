import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { moduleQueryKeys } from "./moduleQueryKeys";

export function useShowModuleIcon(moduleIdentifier?: string) {
    const [iconUrl, setIconUrl] = useState<string | null>(null);

    const query = useQuery({
        queryKey: moduleQueryKeys.icon(moduleIdentifier ?? ''),
        queryFn: async () => {
            const res = await httpClient.get(`/modules/${moduleIdentifier}/icon`, {
                responseType: 'blob'
            });
            return res.data as Blob;
        },
        enabled: !!moduleIdentifier,
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
