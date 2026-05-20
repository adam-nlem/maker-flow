import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '~/services/httpClient/httpClient';
import { reviewsQueryKeys } from './reviewsQueryKeys';

interface DeleteReviewData {
    uuid: string;
    projectUuid: string;
}

export function useDeleteReview() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (data: DeleteReviewData) => {
            await httpClient.delete(`/reviews/${data.uuid}`);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.listAll(variables.projectUuid) });
            queryClient.removeQueries({ queryKey: reviewsQueryKeys.detail(variables.uuid) });
        },
    });

    return {
        deleteReview: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    };
}
