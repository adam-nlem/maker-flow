import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '~/services/httpClient/httpClient';
import { Review, type ReviewJSON } from '~/models/Review';
import { reviewsQueryKeys } from './reviewsQueryKeys';

interface RequestChangesOnReviewVersionData {
    reviewVersionUuid: string;
    reviewUuid: string;
    projectUuid: string;
    comment: string;
}

export function useRequestChangesOnReviewVersion() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (data: RequestChangesOnReviewVersionData) => {
            const response = await httpClient.post<ReviewJSON>(
                `/review-versions/${data.reviewVersionUuid}/request-changes`,
                { comment: data.comment },
            );
            return Review.fromJSON(response.data);
        },
        onSuccess: (review, variables) => {
            queryClient.setQueryData(reviewsQueryKeys.detail(variables.reviewUuid), review);
            queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.listAll(variables.projectUuid) });
        },
    });

    return {
        requestChangesOnReviewVersion: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    };
}
