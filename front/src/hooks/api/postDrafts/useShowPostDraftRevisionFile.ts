import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { postDraftsQueryKeys } from "./postDraftsQueryKeys";

export function useShowPostDraftRevisionFile(revisionUuid?: string, index?: number) {
    const [fileUrl, setFileUrl] = useState<string | null>(null);

    const query = useQuery({
        queryKey: postDraftsQueryKeys.revisionFile(revisionUuid ?? '', index ?? 0),
        queryFn: async () => {
            const res = await httpClient.get(`/post-draft-revisions/${revisionUuid}/files/${index}`, {
                responseType: 'blob'
            });
            return res.data as Blob;
        },
        enabled: !!revisionUuid && index !== undefined,
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
