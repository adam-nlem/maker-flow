import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { scriptQueryKeys } from "../scripts/scriptQueryKeys";
import type { Tone } from "~/models/enums/Tone";

interface CreateScriptVoiceOverData {
    scriptUuid: string;
    content: string;
    tone?: Tone;
    generationUuid?: string;
}

export function useCreateScriptVoiceOver() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (data: CreateScriptVoiceOverData) => {
            await httpClient.post('/scripts/voice-overs', data)
        },
        onSuccess: (_, { scriptUuid }) => {
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.parts(scriptUuid) })
        },
    })

    return {
        createScriptVoiceOver: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
