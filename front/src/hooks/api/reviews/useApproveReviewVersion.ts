import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '~/services/httpClient/httpClient';
import { Review, type ReviewJSON } from '~/models/Review';
import { reviewsQueryKeys } from './reviewsQueryKeys';

interface ApproveReviewVersionData {
    reviewVersionUuid: string;
    reviewUuid: string;
    projectUuid: string;
}

export function useApproveReviewVersion() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (data: ApproveReviewVersionData) => {
            const response = await httpClient.post<ReviewJSON>(
                `/review-versions/${data.reviewVersionUuid}/approve`,
            );
            return Review.fromJSON(response.data);
        },
        onSuccess: (review, variables) => {
            queryClient.setQueryData(reviewsQueryKeys.detail(variables.reviewUuid), review);
            queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.listAll(variables.projectUuid) });
        },
    });

    return {
        approveReviewVersion: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    };
}
