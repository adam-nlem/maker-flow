import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { scriptQueryKeys } from "../scripts/scriptQueryKeys";
import type { ChapterType } from "~/models/enums/ChapterType";

interface CreateScriptChapterData {
    scriptUuid: string;
    title: string;
    description?: string;
    chapterType?: ChapterType;
}

export function useCreateScriptChapter() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (data: CreateScriptChapterData) => {
            await httpClient.post('/scripts/chapters', data)
        },
        onSuccess: (_, { scriptUuid }) => {
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.parts(scriptUuid) })
        },
    })

    return {
        createScriptChapter: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
