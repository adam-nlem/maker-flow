import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { creatorProfileQueryKeys } from "./creatorProfileQueryKeys";
import type { Tone } from "~/models/enums/Tone";

interface CreateOrUpdateCreatorProfileData {
    projectUuid: string;
    niche?: string;
    targetAudience?: string;
    tones?: Tone[];
    signaturePhrases?: string[];
    neverList?: string[];
    styleSample?: string;
}

export function useCreateOrUpdateCreatorProfile() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (data: CreateOrUpdateCreatorProfileData) => {
            await httpClient.post('/creator-profiles', data);
        },
        onSuccess: (_, { projectUuid }) => {
            queryClient.invalidateQueries({ queryKey: creatorProfileQueryKeys.show(projectUuid) });
        },
    });

    return {
        createOrUpdateCreatorProfile: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    };
}
