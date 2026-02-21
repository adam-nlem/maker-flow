import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { scriptQueryKeys } from "../scripts/scriptQueryKeys";

interface CreateDialogueSubjectData {
    scriptDialogueUuid: string;
    scriptUuid: string;
    speaker: string;
    content: string;
}

export function useCreateDialogueSubject() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async ({ scriptUuid, ...data }: CreateDialogueSubjectData) => {
            await httpClient.post('/scripts/dialogue-subjects', {
                scriptDialogueUuid: data.scriptDialogueUuid,
                speaker: data.speaker,
                content: data.content,
            })
        },
        onSuccess: (_, { scriptUuid }) => {
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.parts(scriptUuid) })
        },
    })

    return {
        createDialogueSubject: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
