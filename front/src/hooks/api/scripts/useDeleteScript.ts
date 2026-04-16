import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { AnalyticsEvent } from "~/models/enums/AnalyticsEvent";
import { track } from "~/services/analytics/analytics";
import { scriptQueryKeys } from "./scriptQueryKeys";

export function useDeleteScript() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (scriptUuid: string) => {
            await httpClient.delete(`/scripts/${scriptUuid}`)
        },
        onSuccess: (_data, deletedScriptUuid) => {
            queryClient.removeQueries({ queryKey: scriptQueryKeys.parts(deletedScriptUuid) });
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.all });
            track(AnalyticsEvent.ScriptDeleted)
        },
    })

    return {
        deleteScript: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
