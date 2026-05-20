import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '~/services/httpClient/httpClient';
import { PostDraft, type PostDraftJSON } from '~/models/PostDraft';
import type { PostDraftCommentStatus } from '~/models/enums/PostDraftCommentStatus';
import { postDraftsQueryKeys } from './postDraftsQueryKeys';

interface UpdatePostDraftMediaVersionCommentData {
    body?: string;
    status?: PostDraftCommentStatus;
    videoTimecodeSeconds?: number | null;
}

interface UpdatePostDraftMediaVersionCommentParams {
    commentUuid: string;
    postDraftUuid: string;
    projectUuid: string;
    data: UpdatePostDraftMediaVersionCommentData;
}

export function useUpdatePostDraftMediaVersionComment() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async ({ commentUuid, data }: UpdatePostDraftMediaVersionCommentParams) => {
            const response = await httpClient.patch<PostDraftJSON>(
                `/post-draft-media-version-comments/${commentUuid}`,
                data,
            );
            return PostDraft.fromJSON(response.data);
        },
        onSuccess: (postDraft, { postDraftUuid, projectUuid }) => {
            queryClient.setQueryData(postDraftsQueryKeys.detail(postDraftUuid), postDraft);
            queryClient.invalidateQueries({ queryKey: postDraftsQueryKeys.listAll(projectUuid) });
        },
    });

    return {
        updatePostDraftMediaVersionComment: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    };
}
