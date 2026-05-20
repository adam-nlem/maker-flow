import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '~/services/httpClient/httpClient';
import { PostDraft, type PostDraftJSON } from '~/models/PostDraft';
import { postDraftsQueryKeys } from './postDraftsQueryKeys';

interface RequestChangesOnPostDraftMediaVersionData {
    mediaVersionUuid: string;
    postDraftUuid: string;
    projectUuid: string;
    comment: string;
}

export function useRequestChangesOnPostDraftMediaVersion() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (data: RequestChangesOnPostDraftMediaVersionData) => {
            const response = await httpClient.post<PostDraftJSON>(
                `/post-draft-media-versions/${data.mediaVersionUuid}/request-changes`,
                { comment: data.comment },
            );
            return PostDraft.fromJSON(response.data);
        },
        onSuccess: (postDraft, variables) => {
            queryClient.setQueryData(postDraftsQueryKeys.detail(variables.postDraftUuid), postDraft);
            queryClient.invalidateQueries({ queryKey: postDraftsQueryKeys.listAll(variables.projectUuid) });
        },
    });

    return {
        requestChangesOnPostDraftMediaVersion: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    };
}
