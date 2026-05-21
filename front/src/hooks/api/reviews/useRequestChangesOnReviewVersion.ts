import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '~/services/httpClient/httpClient';
import {
    ReviewWithLatestVersionDTO,
    type ReviewWithLatestVersionDTOJSON,
} from '~/dtos/reviews/ReviewWithLatestVersionDTO';
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
            const response = await httpClient.post<ReviewWithLatestVersionDTOJSON>(
                `/review-versions/${data.reviewVersionUuid}/request-changes`,
                { comment: data.comment },
            );
            return ReviewWithLatestVersionDTO.fromJSON(response.data);
        },
        onSuccess: (review, variables) => {
            queryClient.setQueryData(reviewsQueryKeys.detail(variables.reviewUuid), review);
            queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.listAll(variables.projectUuid) });
            queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.comments(variables.reviewVersionUuid) });
        },
    });

    return {
        requestChangesOnReviewVersion: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    };
}
