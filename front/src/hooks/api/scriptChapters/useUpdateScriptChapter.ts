import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { scriptQueryKeys } from "../scripts/scriptQueryKeys";
import type { ChapterType } from "~/models/enums/ChapterType";

interface UpdateScriptChapterData {
    title?: string;
    description?: string;
    chapterType?: ChapterType;
}

interface UpdateScriptChapterParams {
    chapterUuid: string;
    scriptUuid: string;
    data: UpdateScriptChapterData;
}

export function useUpdateScriptChapter() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async ({ chapterUuid, data }: UpdateScriptChapterParams) => {
            await httpClient.patch(`/scripts/chapters/${chapterUuid}`, data)
        },
        onSuccess: (_, { scriptUuid }) => {
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.parts(scriptUuid) })
        },
    })

    return {
        updateScriptChapter: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
