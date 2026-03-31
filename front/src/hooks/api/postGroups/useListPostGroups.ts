import { useQuery } from "@tanstack/react-query";
import { PostGroup, type PostGroupJSON } from "~/models/PostGroup";
import { httpClient } from "~/services/httpClient/httpClient";
import { postGroupQueryKeys } from "./postGroupQueryKeys";

export function useListPostGroups({ projectUuid }: { projectUuid: string | null }) {
    const query = useQuery({
        queryKey: postGroupQueryKeys.list(projectUuid ?? ''),
        queryFn: async () => {
            const res = await httpClient.get('/post-groups', {
                params: {
                    "projectUuid": projectUuid
                }
            })
            return res.data.map((json: PostGroupJSON) => PostGroup.fromJSON(json)) as PostGroup[]
        },
        enabled: !!projectUuid,
    })

    return {
        postGroups: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error,
    }
}
