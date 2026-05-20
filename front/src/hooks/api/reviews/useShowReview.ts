import { useQuery } from '@tanstack/react-query';
import { Review } from '~/models/Review';
import { httpClient } from '~/services/httpClient/httpClient';
import { reviewsQueryKeys } from './reviewsQueryKeys';

export function useShowReview(uuid: string | null | undefined) {
    const query = useQuery({
        queryKey: reviewsQueryKeys.detail(uuid ?? ''),
        queryFn: async () => {
            const res = await httpClient.get(`/reviews/${uuid}`);
            return Review.fromJSON(res.data);
        },
        enabled: Boolean(uuid),
    });

    return {
        review: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error,
    };
}
