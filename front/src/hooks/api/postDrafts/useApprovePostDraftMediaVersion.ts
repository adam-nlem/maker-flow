import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '~/services/httpClient/httpClient';
import { PostDraft, type PostDraftJSON } from '~/models/PostDraft';
import { postDraftsQueryKeys } from './postDraftsQueryKeys';

interface ApprovePostDraftMediaVersionData {
    mediaVersionUuid: string;
    postDraftUuid: string;
    projectUuid: string;
}

export function useApprovePostDraftMediaVersion() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (data: ApprovePostDraftMediaVersionData) => {
            const response = await httpClient.post<PostDraftJSON>(
                `/post-draft-media-versions/${data.mediaVersionUuid}/approve`,
            );
            return PostDraft.fromJSON(response.data);
        },
        onSuccess: (postDraft, variables) => {
            queryClient.setQueryData(postDraftsQueryKeys.detail(variables.postDraftUuid), postDraft);
            queryClient.invalidateQueries({ queryKey: postDraftsQueryKeys.listAll(variables.projectUuid) });
        },
    });

    return {
        approvePostDraftMediaVersion: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    };
}
