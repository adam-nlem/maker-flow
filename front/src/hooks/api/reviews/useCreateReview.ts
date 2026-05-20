import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '~/services/httpClient/httpClient';
import { Review } from '~/models/Review';
import type { MediaType } from '~/models/enums/MediaType';
import { validateReviewFiles } from '~/utils/reviewFileValidation';
import { reviewsQueryKeys } from './reviewsQueryKeys';

interface CreateReviewData {
    projectUuid: string;
    title: string;
    description?: string | null;
    notes?: string | null;
    mediaType: MediaType;
    scriptUuid?: string | null;
    files: File[];
}

export function useCreateReview() {
    const queryClient = useQueryClient();
    const [validationErrorKey, setValidationErrorKey] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: async (data: CreateReviewData) => {
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

            const res = await httpClient.post('/reviews', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            return Review.fromJSON(res.data);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.listAll(variables.projectUuid) });
        },
    });

    const createReview = async (data: CreateReviewData): Promise<Review | undefined> => {
        if (!data.title.trim()) {
            setValidationErrorKey('reviews:validation.titleRequired');
            return;
        }

        const fileError = validateReviewFiles(data.mediaType, data.files);
        if (fileError) {
            setValidationErrorKey(fileError);
            return;
        }

        setValidationErrorKey(null);
        return await mutation.mutateAsync(data);
    };

    const clearValidationError = () => setValidationErrorKey(null);

    return {
        createReview,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
        validationErrorKey,
        clearValidationError,
    };
}
