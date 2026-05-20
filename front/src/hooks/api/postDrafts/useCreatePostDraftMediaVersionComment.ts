import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '~/services/httpClient/httpClient';
import { PostDraft, type PostDraftJSON } from '~/models/PostDraft';
import { postDraftsQueryKeys } from './postDraftsQueryKeys';

interface CreatePostDraftMediaVersionCommentData {
    mediaVersionUuid: string;
    postDraftUuid: string;
    projectUuid: string;
    body: string;
}

export function useCreatePostDraftMediaVersionComment() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (data: CreatePostDraftMediaVersionCommentData) => {
            const response = await httpClient.post<PostDraftJSON>(
                `/post-draft-media-version-comments`,
                { mediaVersionUuid: data.mediaVersionUuid, body: data.body },
            );
            return PostDraft.fromJSON(response.data);
        },
        onSuccess: (postDraft, variables) => {
            queryClient.setQueryData(postDraftsQueryKeys.detail(variables.postDraftUuid), postDraft);
            queryClient.invalidateQueries({ queryKey: postDraftsQueryKeys.listAll(variables.projectUuid) });
        },
    });

    return {
        createPostDraftMediaVersionComment: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    };
}
