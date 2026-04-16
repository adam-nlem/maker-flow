import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { PostGroupListItemDTO, type PostGroupListItemDTOJSON } from "~/dtos/postGroups/PostGroupListItemDTO";
import { httpClient } from "~/services/httpClient/httpClient";
import { postGroupQueryKeys } from "./postGroupQueryKeys";

interface UseListPostGroupsProps {
  projectUuid: string | null;
  searchTerm?: string;
  limit?: number;
}

export function useListPaginatedPostGroups({ projectUuid, searchTerm, limit = 20 }: UseListPostGroupsProps) {
  const query = useInfiniteQuery({
    queryKey: postGroupQueryKeys.list(projectUuid ?? '', searchTerm),
    queryFn: async ({ pageParam }) => {
      const res = await httpClient.get<PostGroupListItemDTOJSON[]>('/post-groups', {
        params: {
          projectUuid: projectUuid!,
          ...(searchTerm ? { searchTerm } : {}),
          page: pageParam,
          limit,
        },
      });
      return res.data.map((json) => PostGroupListItemDTO.fromJSON(json));
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam) =>
      lastPage.length === limit ? lastPageParam + 1 : undefined,
    enabled: !!projectUuid,
  });

  const postGroups = useMemo(() => query.data?.pages.flat() ?? [], [query.data]);

  return {
    postGroups,
    isLoading: query.isLoading,
    isLoadingMore: query.isFetchingNextPage,
    hasMore: query.hasNextPage,
    error: query.error,
    listMore: query.fetchNextPage,
  };
}
