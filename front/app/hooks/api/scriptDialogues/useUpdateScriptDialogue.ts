import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { scriptQueryKeys } from "../scripts/scriptQueryKeys";

interface UpdateScriptDialogueData {
    title?: string;
    description?: string;
}

interface UpdateScriptDialogueParams {
    dialogueUuid: string;
    scriptUuid: string;
    data: UpdateScriptDialogueData;
}

export function useUpdateScriptDialogue() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async ({ dialogueUuid, data }: UpdateScriptDialogueParams) => {
            await httpClient.patch(`/scripts/dialogues/${dialogueUuid}`, data)
        },
        onSuccess: (_, { scriptUuid }) => {
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.parts(scriptUuid) })
        },
    })

    return {
        updateScriptDialogue: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
