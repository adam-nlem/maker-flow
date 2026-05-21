import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { httpClient } from '~/services/httpClient/httpClient';
import { ReviewComment } from '~/models/ReviewComment';
import { reviewsQueryKeys } from './reviewsQueryKeys';

interface UseListPaginatedReviewCommentsOptions {
    reviewVersionUuid: string | null;
    limit?: number;
}

export function useListPaginatedReviewComments({ reviewVersionUuid, limit = 20 }: UseListPaginatedReviewCommentsOptions) {
    const query = useInfiniteQuery({
        queryKey: reviewsQueryKeys.comments(reviewVersionUuid ?? ''),
        queryFn: async ({ pageParam }) => {
            const res = await httpClient.get('/review-comments', {
                params: {
                    reviewVersionUuid,
                    page: pageParam,
                    limit,
                },
            });
            return res.data.map((json: any) => ReviewComment.fromJSON(json));
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, _, lastPageParam) =>
            lastPage.length === limit ? lastPageParam + 1 : undefined,
        enabled: Boolean(reviewVersionUuid),
    });

    const comments = useMemo(() => query.data?.pages.flat() ?? [], [query.data]);

    return {
        comments,
        isLoading: query.isLoading,
        isLoadingMore: query.isFetchingNextPage,
        hasMore: query.hasNextPage,
        error: query.error,
        listMore: query.fetchNextPage,
    };
}
