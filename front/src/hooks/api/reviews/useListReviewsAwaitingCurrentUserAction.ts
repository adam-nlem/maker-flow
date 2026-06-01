import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { httpClient } from '~/services/httpClient/httpClient';
import {
    ReviewWithLatestVersionDTO,
    type ReviewWithLatestVersionDTOJSON,
} from '~/dtos/reviews/ReviewWithLatestVersionDTO';
import { reviewsQueryKeys } from './reviewsQueryKeys';

interface UseListReviewsAwaitingCurrentUserActionOptions {
    projectUuid: string | null;
    limit?: number;
}

export function useListReviewsAwaitingCurrentUserAction({
    projectUuid,
    limit = 20,
}: UseListReviewsAwaitingCurrentUserActionOptions) {
    const query = useInfiniteQuery({
        queryKey: reviewsQueryKeys.awaitingCurrentUserAction(projectUuid ?? ''),
        queryFn: async ({ pageParam }) => {
            const res = await httpClient.get<ReviewWithLatestVersionDTOJSON[]>('/reviews/awaiting-current-user-action', {
                params: {
                    projectUuid,
                    page: pageParam,
                    limit,
                },
            });
            return res.data.map((json) => ReviewWithLatestVersionDTO.fromJSON(json));
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, _, lastPageParam) =>
            lastPage.length === limit ? lastPageParam + 1 : undefined,
        enabled: Boolean(projectUuid),
    });

    const reviews = useMemo(() => query.data?.pages.flat() ?? [], [query.data]);

    return {
        reviews,
        isLoading: query.isLoading,
        isLoadingMore: query.isFetchingNextPage,
        hasMore: query.hasNextPage,
        error: query.error,
        listMore: query.fetchNextPage,
    };
}
