import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { moduleQueryKeys } from "./moduleQueryKeys";

export function useShowModuleIcon(moduleIdentifier?: string) {
    const query = useQuery({
        queryKey: moduleQueryKeys.icon(moduleIdentifier ?? ''),
        queryFn: async () => {
            const res = await httpClient.get(`/modules/${moduleIdentifier}/icon`, {
                responseType: 'blob'
            });
            return URL.createObjectURL(res.data);
        },
        enabled: !!moduleIdentifier,
        staleTime: Infinity,
    })

    return {
        iconUrl: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error,
    };
}