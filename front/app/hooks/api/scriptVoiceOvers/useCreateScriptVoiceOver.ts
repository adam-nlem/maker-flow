import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { scriptQueryKeys } from "../scripts/scriptQueryKeys";
import type { VoiceOverType } from "~/models/enums/VoiceOverType";

interface CreateScriptVoiceOverData {
    scriptUuid: string;
    content: string;
    voiceOverType?: VoiceOverType;
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
