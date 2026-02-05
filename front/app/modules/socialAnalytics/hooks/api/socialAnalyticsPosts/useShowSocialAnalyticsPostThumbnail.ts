import { useEffect, useMemo } from "react";
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
            return res.data as Blob;
        },
        enabled: !!postUuid,
        staleTime: Infinity,
    });

    const thumbnailUrl = useMemo(() => {
        if (!query.data) return null;
        return URL.createObjectURL(query.data);
    }, [query.data]);

    useEffect(() => {
        return () => {
            if (thumbnailUrl) URL.revokeObjectURL(thumbnailUrl);
        };
    }, [thumbnailUrl]);

    return {
        thumbnailUrl,
        isLoading: query.isLoading,
        error: query.error,
    };
}
