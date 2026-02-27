import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { scriptQueryKeys } from "../scripts/scriptQueryKeys";

interface DeleteScriptRetentionCueData {
    retentionCueUuid: string;
    scriptUuid: string;
}

export function useDeleteScriptRetentionCue() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async ({ retentionCueUuid }: DeleteScriptRetentionCueData) => {
            await httpClient.delete(`/scripts/retention-cues/${retentionCueUuid}`)
        },
        onSuccess: (_, { scriptUuid }) => {
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.parts(scriptUuid) })
        },
    })

    return {
        deleteScriptRetentionCue: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
