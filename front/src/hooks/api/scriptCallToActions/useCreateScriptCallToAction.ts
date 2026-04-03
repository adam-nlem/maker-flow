import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { AnalyticsEvent } from "~/models/enums/AnalyticsEvent";
import { ScriptPartType } from "~/models/enums/ScriptPartType";
import { track } from "~/services/analytics/analytics";
import { scriptQueryKeys } from "../scripts/scriptQueryKeys";
import type { CallToActionType } from "~/models/enums/CallToActionType";

interface CreateScriptCallToActionData {
    scriptUuid: string;
    content: string;
    callToActionType?: CallToActionType;
    generationUuid?: string;
}

export function useCreateScriptCallToAction() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (data: CreateScriptCallToActionData) => {
            await httpClient.post('/scripts/call-to-actions', data)
        },
        onSuccess: (_, { scriptUuid }) => {
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.parts(scriptUuid) })
            track(AnalyticsEvent.ScriptPartAdded, { part_type: ScriptPartType.CallToAction })
        },
    })

    return {
        createScriptCallToAction: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
