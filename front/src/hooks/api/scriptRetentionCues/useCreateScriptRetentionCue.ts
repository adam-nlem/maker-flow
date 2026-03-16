import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { scriptQueryKeys } from "../scripts/scriptQueryKeys";
import type { RetentionCueType } from "~/models/enums/RetentionCueType";

interface CreateScriptRetentionCueData {
    scriptUuid: string;
    content: string;
    retentionCueType?: RetentionCueType;
    generationUuid?: string;
}

export function useCreateScriptRetentionCue() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (data: CreateScriptRetentionCueData) => {
            await httpClient.post('/scripts/retention-cues', data)
        },
        onSuccess: (_, { scriptUuid }) => {
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.parts(scriptUuid) })
        },
    })

    return {
        createScriptRetentionCue: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
