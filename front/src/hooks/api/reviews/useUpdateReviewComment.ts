import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '~/services/httpClient/httpClient';
import {
    ReviewWithLatestVersionDTO,
    type ReviewWithLatestVersionDTOJSON,
} from '~/dtos/reviews/ReviewWithLatestVersionDTO';
import type { ReviewCommentStatus } from '~/models/enums/ReviewCommentStatus';
import { reviewsQueryKeys } from './reviewsQueryKeys';

interface UpdateReviewCommentData {
    body?: string;
    status?: ReviewCommentStatus;
    videoTimecodeSeconds?: number | null;
}

interface UpdateReviewCommentParams {
    commentUuid: string;
    reviewVersionUuid: string;
    reviewUuid: string;
    projectUuid: string;
    data: UpdateReviewCommentData;
}

export function useUpdateReviewComment() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async ({ commentUuid, data }: UpdateReviewCommentParams) => {
            const response = await httpClient.patch<ReviewWithLatestVersionDTOJSON>(
                `/review-comments/${commentUuid}`,
                data,
            );
            return ReviewWithLatestVersionDTO.fromJSON(response.data);
        },
        onSuccess: (review, { reviewVersionUuid, reviewUuid, projectUuid }) => {
            queryClient.setQueryData(reviewsQueryKeys.detail(reviewUuid), review);
            queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.listAll(projectUuid) });
            queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.comments(reviewVersionUuid) });
        },
    });

    return {
        updateReviewComment: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    };
}
