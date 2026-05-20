import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '~/services/httpClient/httpClient';
import { Review, type ReviewJSON } from '~/models/Review';
import { reviewsQueryKeys } from './reviewsQueryKeys';

interface CreateReviewCommentData {
    reviewVersionUuid: string;
    body: string;
    parentCommentUuid?: string;
    videoTimecodeSeconds?: number | null;
}

interface CreateReviewCommentParams {
    reviewUuid: string;
    projectUuid: string;
    data: CreateReviewCommentData;
}

export function useCreateReviewComment() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async ({ data }: CreateReviewCommentParams) => {
            const response = await httpClient.post<ReviewJSON>(
                `/review-comments`,
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
        createReviewComment: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    };
}
