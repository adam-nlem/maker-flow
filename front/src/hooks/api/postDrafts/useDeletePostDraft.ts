import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '~/services/httpClient/httpClient';
import { postDraftsQueryKeys } from './postDraftsQueryKeys';

interface DeletePostDraftData {
    uuid: string;
    projectUuid: string;
}

export function useDeletePostDraft() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (data: DeletePostDraftData) => {
            await httpClient.delete(`/post-drafts/${data.uuid}`);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: postDraftsQueryKeys.listAll(variables.projectUuid) });
            queryClient.removeQueries({ queryKey: postDraftsQueryKeys.detail(variables.uuid) });
        },
    });

    return {
        deletePostDraft: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    };
}
