import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { postDraftsQueryKeys } from "./postDraftsQueryKeys";

export function useShowPostDraftMediaVersionFile(mediaVersionUuid?: string, index?: number) {
    const [fileUrl, setFileUrl] = useState<string | null>(null);

    const query = useQuery({
        queryKey: postDraftsQueryKeys.mediaVersionFile(mediaVersionUuid ?? '', index ?? 0),
        queryFn: async () => {
            const res = await httpClient.get(`/post-draft-media-versions/${mediaVersionUuid}/files/${index}`, {
                responseType: 'blob'
            });
            return res.data as Blob;
        },
        enabled: !!mediaVersionUuid && index !== undefined,
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
