import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '~/services/httpClient/httpClient';
import { reviewsQueryKeys } from './reviewsQueryKeys';

interface UpdateReviewData {
    uuid: string;
    projectUuid: string;
    title?: string;
    description?: string | null;
    notes?: string | null;
    scriptUuid?: string | null;
}

export function useUpdateReview() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (data: UpdateReviewData) => {
            await httpClient.patch(`/reviews/${data.uuid}`, {
                title: data.title,
                description: data.description,
                notes: data.notes,
                scriptUuid: data.scriptUuid,
            });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.detail(variables.uuid) });
            queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.listAll(variables.projectUuid) });
        },
    });

    return {
        updateReview: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    };
}
