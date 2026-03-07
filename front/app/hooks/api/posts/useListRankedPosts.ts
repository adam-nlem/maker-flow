import { useQuery } from "@tanstack/react-query";
import { PostWithAggregatedInsightsDTO, type PostWithAggregatedInsightsDTOJSON } from "~/dtos/posts/PostWithAggregatedInsightsDTO";
import { httpClient } from "~/services/httpClient/httpClient";
import { postQueryKeys } from "./postQueryKeys";

interface UseListRankedPostsProps {
    integrationUuid: string;
    limit?: number;
}

export function useListRankedPosts({ integrationUuid, limit = 10 }: UseListRankedPostsProps) {
    const query = useQuery({
        queryKey: postQueryKeys.rank(integrationUuid),
        queryFn: async () => {
            const res = await httpClient.get<PostWithAggregatedInsightsDTOJSON[]>(`/posts/rank`, {
                params: { integrationUuid, limit },
            });

            return res.data.map((json) => PostWithAggregatedInsightsDTO.fromJSON(json));
        },
    });

    return {
        posts: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error,
    };
}
