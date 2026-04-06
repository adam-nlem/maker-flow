import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { AnalyticsEvent } from "~/models/enums/AnalyticsEvent";
import { ScriptPartType } from "~/models/enums/ScriptPartType";
import { track } from "~/services/analytics/analytics";
import { scriptQueryKeys } from "../scripts/scriptQueryKeys";
import type { ChapterType } from "~/models/enums/ChapterType";

interface CreateScriptChapterData {
    scriptUuid: string;
    title: string;
    description?: string;
    chapterType?: ChapterType;
    generationUuid?: string;
}

export function useCreateScriptChapter() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (data: CreateScriptChapterData) => {
            await httpClient.post('/scripts/chapters', data)
        },
        onSuccess: (_, { scriptUuid }) => {
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.parts(scriptUuid) })
            track(AnalyticsEvent.ScriptPartAdded, { part_type: ScriptPartType.Chapter })
        },
    })

    return {
        createScriptChapter: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
