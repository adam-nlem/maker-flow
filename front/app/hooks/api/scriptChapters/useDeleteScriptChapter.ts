import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { scriptQueryKeys } from "../scripts/scriptQueryKeys";

interface DeleteScriptChapterData {
    chapterUuid: string;
    scriptUuid: string;
}

export function useDeleteScriptChapter() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async ({ chapterUuid }: DeleteScriptChapterData) => {
            await httpClient.delete(`/scripts/chapters/${chapterUuid}`)
        },
        onSuccess: (_, { scriptUuid }) => {
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.parts(scriptUuid) })
        },
    })

    return {
        deleteScriptChapter: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
