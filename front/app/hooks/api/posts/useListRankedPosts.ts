import { useQuery } from "@tanstack/react-query";
import { PostWithInsightsDTO, type PostWithInsightsDTOJSON } from "~/dtos/posts/PostWithInsightsDTO";
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
            const res = await httpClient.get<PostWithInsightsDTOJSON[]>(`/posts/rank`, {
                params: { integrationUuid, limit },
            });

            return res.data.map((json) => PostWithInsightsDTO.fromJSON(json));
        },
    });

    return {
        posts: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error,
    };
}
