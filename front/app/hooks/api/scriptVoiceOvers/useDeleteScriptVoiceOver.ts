import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { scriptQueryKeys } from "../scripts/scriptQueryKeys";

interface DeleteScriptVoiceOverData {
    voiceOverUuid: string;
    scriptUuid: string;
}

export function useDeleteScriptVoiceOver() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async ({ voiceOverUuid }: DeleteScriptVoiceOverData) => {
            await httpClient.delete(`/scripts/voice-overs/${voiceOverUuid}`)
        },
        onSuccess: (_, { scriptUuid }) => {
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.parts(scriptUuid) })
        },
    })

    return {
        deleteScriptVoiceOver: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
