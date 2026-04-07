import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { PostGroupWithInsightsAndScriptDTO, type PostGroupWithInsightsAndScriptDTOJSON } from "~/dtos/postGroups/PostGroupWithInsightsAndScriptDTO";
import { postGroupQueryKeys } from "./postGroupQueryKeys";

export function useShowPostGroup(postGroupUuid?: string) {
    const query = useQuery({
        queryKey: postGroupQueryKeys.show(postGroupUuid!),
        queryFn: async () => {
            const res = await httpClient.get<PostGroupWithInsightsAndScriptDTOJSON>(`/post-groups/${postGroupUuid}`);
            return PostGroupWithInsightsAndScriptDTO.fromJSON(res.data);
        },
        enabled: !!postGroupUuid,
    });

    return {
        postGroup: query.data ?? null,
        isLoading: query.isLoading,
    };
}
