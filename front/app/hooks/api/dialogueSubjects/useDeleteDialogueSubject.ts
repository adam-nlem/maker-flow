import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { scriptQueryKeys } from "../scripts/scriptQueryKeys";

interface DeleteDialogueSubjectData {
    subjectUuid: string;
    scriptUuid: string;
}

export function useDeleteDialogueSubject() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async ({ subjectUuid }: DeleteDialogueSubjectData) => {
            await httpClient.delete(`/scripts/dialogue-subjects/${subjectUuid}`)
        },
        onSuccess: (_, { scriptUuid }) => {
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.parts(scriptUuid) })
        },
    })

    return {
        deleteDialogueSubject: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
