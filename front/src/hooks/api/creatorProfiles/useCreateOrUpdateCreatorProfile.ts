import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { AnalyticsEvent } from "~/models/enums/AnalyticsEvent";
import { track } from "~/services/analytics/analytics";
import { creatorProfileQueryKeys } from "./creatorProfileQueryKeys";
import type { Tone } from "~/models/enums/Tone";

interface CreateOrUpdateCreatorProfileData {
    projectUuid: string;
    niche?: string;
    tones?: Tone[];
    signaturePhrases?: string[];
    neverList?: string[];
}

export function useCreateOrUpdateCreatorProfile() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (data: CreateOrUpdateCreatorProfileData) => {
            await httpClient.post('/creator-profiles', data);
        },
        onSuccess: (_, { projectUuid }) => {
            queryClient.invalidateQueries({ queryKey: creatorProfileQueryKeys.show(projectUuid) });
            track(AnalyticsEvent.CreatorProfileSaved)
        },
    });

    return {
        createOrUpdateCreatorProfile: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    };
}
