import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { postQueryKeys } from "./postQueryKeys";
import type { Platform } from "~/models/enums/Platform";
import type { MediaType } from "~/models/enums/MediaType";

//TODO: Clean this
export interface SearchPostResult {
    uuid: string;
    caption: string | null;
    publishedAt: string;
    mediaType: MediaType;
    platform: Platform;
    postGroupUuid: string | null;
}

interface UseSearchPostsProps {
    projectUuid: string | null;
    platform: Platform | null;
    search: string;
}

export function useSearchPosts({ projectUuid, platform, search }: UseSearchPostsProps) {
    const query = useQuery({
        queryKey: [...postQueryKeys.search(projectUuid ?? ''), platform, search],
        queryFn: async () => {
            const params: Record<string, string | number> = {
                projectUuid: projectUuid!,
                search,
            };
            if (platform) params.platform = platform;

            const res = await httpClient.get<SearchPostResult[]>(`/posts/search`, { params });
            return res.data;
        },
        enabled: !!projectUuid && search.length >= 2,
    });

    return {
        results: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error,
    };
}
