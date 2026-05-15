import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { httpClient } from '~/services/httpClient/httpClient';
import { PostDraft } from '~/models/PostDraft';
import { postDraftsQueryKeys } from './postDraftsQueryKeys';

interface UseListPaginatedPostDraftsOptions {
    projectUuid: string | null;
    limit?: number;
}

export function useListPaginatedPostDrafts({ projectUuid, limit = 20 }: UseListPaginatedPostDraftsOptions) {
    const query = useInfiniteQuery({
        queryKey: postDraftsQueryKeys.list(projectUuid ?? '', limit),
        queryFn: async ({ pageParam }) => {
            const res = await httpClient.get('/post-drafts', {
                params: { projectUuid, page: pageParam, limit },
            });
            return res.data.map((json: any) => PostDraft.fromJSON(json));
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, _, lastPageParam) =>
            lastPage.length === limit ? lastPageParam + 1 : undefined,
        enabled: Boolean(projectUuid),
    });

    const postDrafts = useMemo(() => query.data?.pages.flat() ?? [], [query.data]);

    return {
        postDrafts,
        isLoading: query.isLoading,
        isLoadingMore: query.isFetchingNextPage,
        hasMore: query.hasNextPage,
        error: query.error,
        listMore: query.fetchNextPage,
    };
}
