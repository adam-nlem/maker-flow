import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { scriptQueryKeys } from "../scripts/scriptQueryKeys";
import type { VoiceOverType } from "~/models/enums/VoiceOverType";

interface UpdateScriptVoiceOverData {
    content?: string;
    voiceOverType?: VoiceOverType;
}

interface UpdateScriptVoiceOverParams {
    voiceOverUuid: string;
    scriptUuid: string;
    data: UpdateScriptVoiceOverData;
}

export function useUpdateScriptVoiceOver() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async ({ voiceOverUuid, data }: UpdateScriptVoiceOverParams) => {
            await httpClient.patch(`/scripts/voice-overs/${voiceOverUuid}`, data)
        },
        onSuccess: (_, { scriptUuid }) => {
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.parts(scriptUuid) })
        },
    })

    return {
        updateScriptVoiceOver: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
