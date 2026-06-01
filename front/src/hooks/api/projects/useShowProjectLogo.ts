import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { projectQueryKeys } from "./projectQueryKeys";

export function useShowProjectLogo(projectUuid?: string) {
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    const query = useQuery({
        queryKey: projectQueryKeys.logo(projectUuid ?? ''),
        queryFn: async () => {
            const res = await httpClient.get(`/projects/${projectUuid}/logo`, {
                responseType: 'blob'
            });

            const blob = res.data as Blob;
            if (res.status === 204 || !(blob instanceof Blob) || blob.size === 0) {
                return null;
            }

            return blob;
        },
        enabled: !!projectUuid,
        staleTime: Infinity,
    });

    useEffect(() => {
        if (!query.data) {
            setLogoUrl(null);
            return;
        }

        const url = URL.createObjectURL(query.data);
        setLogoUrl(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [query.data]);

    return {
        logoUrl,
        isLoading: query.isLoading,
        error: query.error,
    };
}
