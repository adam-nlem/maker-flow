import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '~/services/httpClient/httpClient';
import { Review, type ReviewJSON } from '~/models/Review';
import type { ReviewCommentStatus } from '~/models/enums/ReviewCommentStatus';
import { reviewsQueryKeys } from './reviewsQueryKeys';

interface UpdateReviewCommentData {
    body?: string;
    status?: ReviewCommentStatus;
    videoTimecodeSeconds?: number | null;
}

interface UpdateReviewCommentParams {
    commentUuid: string;
    reviewUuid: string;
    projectUuid: string;
    data: UpdateReviewCommentData;
}

export function useUpdateReviewComment() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async ({ commentUuid, data }: UpdateReviewCommentParams) => {
            const response = await httpClient.patch<ReviewJSON>(
                `/review-comments/${commentUuid}`,
                data,
            );
            return Review.fromJSON(response.data);
        },
        onSuccess: (review, { reviewUuid, projectUuid }) => {
            queryClient.setQueryData(reviewsQueryKeys.detail(reviewUuid), review);
            queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.listAll(projectUuid) });
        },
    });

    return {
        updateReviewComment: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    };
}
