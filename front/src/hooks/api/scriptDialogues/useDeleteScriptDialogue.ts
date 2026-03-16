import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { scriptQueryKeys } from "../scripts/scriptQueryKeys";

interface DeleteScriptDialogueData {
    dialogueUuid: string;
    scriptUuid: string;
}

export function useDeleteScriptDialogue() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async ({ dialogueUuid }: DeleteScriptDialogueData) => {
            await httpClient.delete(`/scripts/dialogues/${dialogueUuid}`)
        },
        onSuccess: (_, { scriptUuid }) => {
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.parts(scriptUuid) })
        },
    })

    return {
        deleteScriptDialogue: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
