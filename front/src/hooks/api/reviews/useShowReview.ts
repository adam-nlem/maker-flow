import { useQuery } from '@tanstack/react-query';
import {
    ReviewWithLatestVersionDTO,
    type ReviewWithLatestVersionDTOJSON,
} from '~/dtos/reviews/ReviewWithLatestVersionDTO';
import { httpClient } from '~/services/httpClient/httpClient';
import { reviewsQueryKeys } from './reviewsQueryKeys';

export function useShowReview(uuid: string | null | undefined) {
    const query = useQuery({
        queryKey: reviewsQueryKeys.detail(uuid ?? ''),
        queryFn: async () => {
            const res = await httpClient.get<ReviewWithLatestVersionDTOJSON>(`/reviews/${uuid}`);
            return ReviewWithLatestVersionDTO.fromJSON(res.data);
        },
        enabled: Boolean(uuid),
    });

    return {
        review: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error,
    };
}
