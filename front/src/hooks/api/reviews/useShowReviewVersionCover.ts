import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { reviewsQueryKeys } from "./reviewsQueryKeys";

export function useShowReviewVersionCover(reviewVersionUuid?: string) {
    const [coverUrl, setCoverUrl] = useState<string | null>(null);

    const query = useQuery({
        queryKey: reviewsQueryKeys.cover(reviewVersionUuid ?? ''),
        queryFn: async () => {
            const res = await httpClient.get(`/review-versions/${reviewVersionUuid}/cover`, {
                responseType: 'blob',
            });

            const blob = res.data as Blob;
            if (res.status === 204 || !(blob instanceof Blob) || blob.size === 0) {
                return null;
            }

            return blob;
        },
        enabled: !!reviewVersionUuid,
        staleTime: Infinity,
    });

    useEffect(() => {
        if (!query.data) {
            setCoverUrl(null);
            return;
        }

        const url = URL.createObjectURL(query.data);
        setCoverUrl(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [query.data]);

    return {
        coverUrl,
        isLoading: query.isLoading,
        error: query.error,
    };
}
