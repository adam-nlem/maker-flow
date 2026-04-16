import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { AnalyticsEvent } from "~/models/enums/AnalyticsEvent";
import { track } from "~/services/analytics/analytics";
import { Script, type ScriptJSON } from "~/models/Script";
import { scriptQueryKeys } from "./scriptQueryKeys";

interface CreateScriptData {
    projectUuid: string;
    title: string;
    publishedAt?: string;
    tagUuids?: string[];
    platforms?: string[];
    status?: string;
}

export function useCreateScript() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (data: CreateScriptData): Promise<Script> => {
            const res = await httpClient.post('/scripts', data)
            return Script.fromJSON(res.data as ScriptJSON)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.all });
            track(AnalyticsEvent.ScriptCreated)
        },
    })

    return {
        createScript: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
