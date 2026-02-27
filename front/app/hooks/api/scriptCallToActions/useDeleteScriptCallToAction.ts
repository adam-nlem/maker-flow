import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { scriptQueryKeys } from "../scripts/scriptQueryKeys";

interface DeleteScriptCallToActionData {
    callToActionUuid: string;
    scriptUuid: string;
}

export function useDeleteScriptCallToAction() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async ({ callToActionUuid }: DeleteScriptCallToActionData) => {
            await httpClient.delete(`/scripts/call-to-actions/${callToActionUuid}`)
        },
        onSuccess: (_, { scriptUuid }) => {
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.parts(scriptUuid) })
        },
    })

    return {
        deleteScriptCallToAction: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
