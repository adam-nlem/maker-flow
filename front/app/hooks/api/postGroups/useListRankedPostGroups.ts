import { useQuery } from "@tanstack/react-query";
import { PostGroupWithAggregatedInsightsDTO, type PostGroupWithAggregatedInsightsDTOJSON } from "~/dtos/postGroups/PostGroupWithAggregatedInsightsDTO";
import { httpClient } from "~/services/httpClient/httpClient";
import { postGroupQueryKeys } from "./postGroupQueryKeys";

interface UseListRankedPostGroupsProps {
    projectUuid: string;
    limit?: number;
}

export function useListRankedPostGroups({ projectUuid, limit = 10 }: UseListRankedPostGroupsProps) {
    const query = useQuery({
        queryKey: postGroupQueryKeys.rank(projectUuid),
        queryFn: async () => {
            const res = await httpClient.get<PostGroupWithAggregatedInsightsDTOJSON[]>(`/post-groups/rank`, {
                params: { projectUuid, limit },
            });

            return res.data.map((json) => PostGroupWithAggregatedInsightsDTO.fromJSON(json));
        },
    });

    return {
        postGroups: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error,
    };
}
