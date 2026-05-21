import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '~/services/httpClient/httpClient';
import {
    ReviewWithLatestVersionDTO,
    type ReviewWithLatestVersionDTOJSON,
} from '~/dtos/reviews/ReviewWithLatestVersionDTO';
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
            const response = await httpClient.post<ReviewWithLatestVersionDTOJSON>(
                `/review-comments`,
                data,
            );
            return ReviewWithLatestVersionDTO.fromJSON(response.data);
        },
        onSuccess: (_review, { data }) => {
            queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.comments(data.reviewVersionUuid) });
        },
    });

    return {
        createReviewComment: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    };
}
