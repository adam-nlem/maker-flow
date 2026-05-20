import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { reviewsQueryKeys } from "./reviewsQueryKeys";

export function useShowReviewVersionStream(reviewVersionUuid?: string, path?: string) {
    const [fileUrl, setFileUrl] = useState<string | null>(null);

    const query = useQuery({
        queryKey: reviewsQueryKeys.versionStream(reviewVersionUuid ?? '', path ?? ''),
        queryFn: async () => {
            const res = await httpClient.get(`/review-versions/stream`, {
                params: { reviewVersionUuid, path },
                responseType: 'blob',
            });
            return res.data as Blob;
        },
        enabled: !!reviewVersionUuid && !!path,
        staleTime: Infinity,
    });

    useEffect(() => {
        if (!query.data) {
            setFileUrl(null);
            return;
        }

        const url = URL.createObjectURL(query.data);
        setFileUrl(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [query.data]);

    return {
        fileUrl,
        isLoading: query.isLoading,
        error: query.error,
    };
}
