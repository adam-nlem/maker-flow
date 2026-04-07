import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { PostWithPlatformAndInsightsDTO, type PostWithPlatformAndInsightsDTOJSON } from "~/dtos/posts/PostWithPlatformAndInsightsDTO";
import { postQueryKeys } from "./postQueryKeys";

export function useShowPost(postUuid?: string) {
    const query = useQuery({
        queryKey: postQueryKeys.show(postUuid!),
        queryFn: async () => {
            const res = await httpClient.get<PostWithPlatformAndInsightsDTOJSON>(`/posts/${postUuid}`);
            return PostWithPlatformAndInsightsDTO.fromJSON(res.data);
        },
        enabled: !!postUuid,
    });

    return {
        post: query.data ?? null,
        isLoading: query.isLoading,
    };
}
