import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { httpClient } from '~/services/httpClient/httpClient';
import {
    ReviewCommentsGroupedByReviewDTO,
    type ReviewCommentsGroupedByReviewDTOJSON,
} from '~/dtos/reviews/ReviewCommentsGroupedByReviewDTO';
import { reviewsQueryKeys } from './reviewsQueryKeys';

interface UseListPendingReviewCommentsOptions {
    projectUuid: string | null;
    limit?: number;
}

export function useListPendingReviewComments({ projectUuid, limit = 20 }: UseListPendingReviewCommentsOptions) {
    const query = useInfiniteQuery({
        queryKey: reviewsQueryKeys.pendingComments(projectUuid ?? ''),
        queryFn: async ({ pageParam }) => {
            const res = await httpClient.get<ReviewCommentsGroupedByReviewDTOJSON[]>('/review-comments/pending', {
                params: {
                    projectUuid,
                    page: pageParam,
                    limit,
                },
            });
            return res.data.map((json) => ReviewCommentsGroupedByReviewDTO.fromJSON(json));
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, _, lastPageParam) =>
            lastPage.length === limit ? lastPageParam + 1 : undefined,
        enabled: Boolean(projectUuid),
    });

    const groups = useMemo(() => query.data?.pages.flat() ?? [], [query.data]);

    return {
        groups,
        isLoading: query.isLoading,
        isLoadingMore: query.isFetchingNextPage,
        hasMore: query.hasNextPage,
        error: query.error,
        listMore: query.fetchNextPage,
    };
}
