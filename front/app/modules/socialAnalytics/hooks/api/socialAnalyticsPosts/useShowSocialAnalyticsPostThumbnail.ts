import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { socialAnalyticsPostQueryKeys } from "./socialAnalyticsPostQueryKeys";

export function useShowSocialAnalyticsPostThumbnail(postUuid?: string) {
    const query = useQuery({
        queryKey: socialAnalyticsPostQueryKeys.thumbnail(postUuid ?? ''),
        queryFn: async () => {
            const res = await httpClient.get(`/modules/social-analytics/posts/${postUuid}/thumbnail`, {
                responseType: 'blob'
            });
            return URL.createObjectURL(res.data);
        },
        enabled: !!postUuid,
        staleTime: Infinity,
    });

    return {
        thumbnailUrl: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error,
    };
}
