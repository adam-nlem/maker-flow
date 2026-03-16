import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { scriptQueryKeys } from "../scripts/scriptQueryKeys";
import type { RetentionCueType } from "~/models/enums/RetentionCueType";

interface UpdateScriptRetentionCueData {
    content?: string;
    retentionCueType?: RetentionCueType;
}

interface UpdateScriptRetentionCueParams {
    retentionCueUuid: string;
    scriptUuid: string;
    data: UpdateScriptRetentionCueData;
}

export function useUpdateScriptRetentionCue() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async ({ retentionCueUuid, data }: UpdateScriptRetentionCueParams) => {
            await httpClient.patch(`/scripts/retention-cues/${retentionCueUuid}`, data)
        },
        onSuccess: (_, { scriptUuid }) => {
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.parts(scriptUuid) })
        },
    })

    return {
        updateScriptRetentionCue: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
