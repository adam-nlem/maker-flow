import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '~/services/httpClient/httpClient';
import {
    ReviewWithLatestVersionDTO,
    type ReviewWithLatestVersionDTOJSON,
} from '~/dtos/reviews/ReviewWithLatestVersionDTO';
import type { MediaType } from '~/models/enums/MediaType';
import { validateReviewFiles } from '~/utils/reviewFileValidation';
import { agencyQueryKeys } from '~/hooks/api/agency/agencyQueryKeys';
import { reviewsQueryKeys } from './reviewsQueryKeys';

interface CreateReviewVersionData {
    reviewUuid: string;
    projectUuid: string;
    mediaType: MediaType;
    files: File[];
}

export function useCreateReviewVersion() {
    const queryClient = useQueryClient();
    const [validationErrorKey, setValidationErrorKey] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: async (data: CreateReviewVersionData) => {
            const formData = new FormData();
            formData.append('reviewUuid', data.reviewUuid);

            for (const file of data.files) {
                formData.append('files[]', file);
            }

            const res = await httpClient.post<ReviewWithLatestVersionDTOJSON>(
                '/review-versions',
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } },
            );

            return ReviewWithLatestVersionDTO.fromJSON(res.data);
        },
        onSuccess: (result, variables) => {
            queryClient.setQueryData(reviewsQueryKeys.detail(variables.reviewUuid), result);
            queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.listAll(variables.projectUuid) });
            queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.pendingComments(variables.projectUuid) });
            queryClient.invalidateQueries({ queryKey: agencyQueryKeys.usage() });
        },
    });

    const createReviewVersion = async (
        data: CreateReviewVersionData,
    ): Promise<ReviewWithLatestVersionDTO | undefined> => {
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
        createReviewVersion,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
        validationErrorKey,
        clearValidationError,
    };
}
