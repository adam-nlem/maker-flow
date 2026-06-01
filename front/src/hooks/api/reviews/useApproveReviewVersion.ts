import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '~/services/httpClient/httpClient';
import {
    ReviewWithLatestVersionDTO,
    type ReviewWithLatestVersionDTOJSON,
} from '~/dtos/reviews/ReviewWithLatestVersionDTO';
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
            const response = await httpClient.post<ReviewWithLatestVersionDTOJSON>(
                `/review-versions/${data.reviewVersionUuid}/approve`,
            );
            return ReviewWithLatestVersionDTO.fromJSON(response.data);
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
