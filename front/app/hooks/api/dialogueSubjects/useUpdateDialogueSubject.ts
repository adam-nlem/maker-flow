import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { scriptQueryKeys } from "../scripts/scriptQueryKeys";

interface UpdateDialogueSubjectData {
    speaker?: string;
    content?: string;
}

interface UpdateDialogueSubjectParams {
    subjectUuid: string;
    scriptUuid: string;
    data: UpdateDialogueSubjectData;
}

export function useUpdateDialogueSubject() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async ({ subjectUuid, data }: UpdateDialogueSubjectParams) => {
            await httpClient.patch(`/scripts/dialogue-subjects/${subjectUuid}`, data)
        },
        onSuccess: (_, { scriptUuid }) => {
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.parts(scriptUuid) })
        },
    })

    return {
        updateDialogueSubject: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
