import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { AnalyticsEvent } from "~/models/enums/AnalyticsEvent";
import { ScriptPartType } from "~/models/enums/ScriptPartType";
import { track } from "~/services/analytics/analytics";
import { scriptQueryKeys } from "../scripts/scriptQueryKeys";

interface CreateScriptDialogueData {
    scriptUuid: string;
    title: string;
    description?: string;
    generationUuid?: string;
}

export function useCreateScriptDialogue() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (data: CreateScriptDialogueData) => {
            await httpClient.post('/scripts/dialogues', data)
        },
        onSuccess: (_, { scriptUuid }) => {
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.parts(scriptUuid) })
            track(AnalyticsEvent.ScriptPartAdded, { part_type: ScriptPartType.Dialogue })
        },
    })

    return {
        createScriptDialogue: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
