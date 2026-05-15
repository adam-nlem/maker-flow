import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '~/services/httpClient/httpClient';
import { postDraftsQueryKeys } from './postDraftsQueryKeys';

interface UpdatePostDraftData {
    uuid: string;
    projectUuid: string;
    title?: string;
    description?: string | null;
    notes?: string | null;
    scriptUuid?: string | null;
}

export function useUpdatePostDraft() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (data: UpdatePostDraftData) => {
            await httpClient.patch(`/post-drafts/${data.uuid}`, {
                title: data.title,
                description: data.description,
                notes: data.notes,
                scriptUuid: data.scriptUuid,
            });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: postDraftsQueryKeys.detail(variables.uuid) });
            queryClient.invalidateQueries({ queryKey: postDraftsQueryKeys.listAll(variables.projectUuid) });
        },
    });

    return {
        updatePostDraft: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    };
}
