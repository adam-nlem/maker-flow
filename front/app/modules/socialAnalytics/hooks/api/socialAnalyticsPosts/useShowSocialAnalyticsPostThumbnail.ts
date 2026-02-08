import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { socialAnalyticsPostQueryKeys } from "./socialAnalyticsPostQueryKeys";

export function useShowSocialAnalyticsPostThumbnail(postUuid?: string) {
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

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

    useEffect(() => {
        if (!query.data) {
            setThumbnailUrl(null);
            return;
        }

        const url = URL.createObjectURL(query.data);
        setThumbnailUrl(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [query.data]);

    return {
        thumbnailUrl,
        isLoading: query.isLoading,
        error: query.error,
    };
}
