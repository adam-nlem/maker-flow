import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { httpClient } from '~/services/httpClient/httpClient';
import {
    ReviewWithLatestVersionDTO,
    type ReviewWithLatestVersionDTOJSON,
} from '~/dtos/reviews/ReviewWithLatestVersionDTO';
import type { ReviewStatus } from '~/models/enums/ReviewStatus';
import { reviewsQueryKeys } from './reviewsQueryKeys';

interface UseListPaginatedReviewsOptions {
    projectUuid: string | null;
    limit?: number;
    status?: ReviewStatus;
    searchTerm?: string;
}

export function useListPaginatedReviews({ projectUuid, limit = 20, status, searchTerm }: UseListPaginatedReviewsOptions) {
    const query = useInfiniteQuery({
        queryKey: reviewsQueryKeys.list(projectUuid ?? '', status, searchTerm),
        queryFn: async ({ pageParam }) => {
            const res = await httpClient.get<ReviewWithLatestVersionDTOJSON[]>('/reviews', {
                params: {
                    projectUuid,
                    page: pageParam,
                    limit,
                    ...(status && { status }),
                    ...(searchTerm && { searchTerm }),
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
