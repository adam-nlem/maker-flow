import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '~/services/httpClient/httpClient';
import { PostDraft } from '~/models/PostDraft';
import type { MediaType } from '~/models/enums/MediaType';
import { validatePostDraftFiles } from '~/utils/postDraftFileValidation';
import { postDraftsQueryKeys } from './postDraftsQueryKeys';

interface CreatePostDraftData {
    projectUuid: string;
    title: string;
    description?: string | null;
    notes?: string | null;
    mediaType: MediaType;
    scriptUuid?: string | null;
    files: File[];
}

export function useCreatePostDraft() {
    const queryClient = useQueryClient();
    const [validationErrorKey, setValidationErrorKey] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: async (data: CreatePostDraftData) => {
            const formData = new FormData();
            formData.append('projectUuid', data.projectUuid);
            formData.append('title', data.title);
            formData.append('mediaType', data.mediaType);

            if (data.description) formData.append('description', data.description);
            if (data.notes) formData.append('notes', data.notes);
            if (data.scriptUuid) formData.append('scriptUuid', data.scriptUuid);

            for (const file of data.files) {
                formData.append('files[]', file);
            }

            const res = await httpClient.post('/post-drafts', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            return PostDraft.fromJSON(res.data);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: postDraftsQueryKeys.listAll(variables.projectUuid) });
        },
    });

    const createPostDraft = async (data: CreatePostDraftData): Promise<PostDraft | undefined> => {
        if (!data.title.trim()) {
            setValidationErrorKey('postDrafts:validation.titleRequired');
            return;
        }

        const fileError = validatePostDraftFiles(data.mediaType, data.files);
        if (fileError) {
            setValidationErrorKey(fileError);
            return;
        }

        setValidationErrorKey(null);
        return await mutation.mutateAsync(data);
    };

    const clearValidationError = () => setValidationErrorKey(null);

    return {
        createPostDraft,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
        validationErrorKey,
        clearValidationError,
    };
}
