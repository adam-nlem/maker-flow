import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { postInsightQueryKeys } from "./postInsightQueryKeys";
import { PostInsightDetailDTO, type PostInsightDetailDTOJSON } from "~/dtos/postInsights/PostInsightDetailDTO";

interface UseShowPostInsightDetailProps {
    postUuid: string;
    enabled?: boolean;
}

export function useShowPostInsightDetail({
    postUuid,
    enabled = true,
}: UseShowPostInsightDetailProps) {
    const query = useQuery({
        queryKey: postInsightQueryKeys.detail(postUuid),
        enabled: enabled,
        queryFn: async () => {
            const res = await httpClient.get<PostInsightDetailDTOJSON>('/post-insights/detail', {
                params: {
                    postUuid,
                }
            });

            return PostInsightDetailDTO.fromJSON(res.data);
        },
    });

    return {
        detail: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error,
    };
}
