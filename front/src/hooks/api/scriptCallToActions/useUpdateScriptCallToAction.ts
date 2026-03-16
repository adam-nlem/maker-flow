import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { scriptQueryKeys } from "../scripts/scriptQueryKeys";
import type { CallToActionType } from "~/models/enums/CallToActionType";

interface UpdateScriptCallToActionData {
    content?: string;
    callToActionType?: CallToActionType;
}

interface UpdateScriptCallToActionParams {
    callToActionUuid: string;
    scriptUuid: string;
    data: UpdateScriptCallToActionData;
}

export function useUpdateScriptCallToAction() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async ({ callToActionUuid, data }: UpdateScriptCallToActionParams) => {
            await httpClient.patch(`/scripts/call-to-actions/${callToActionUuid}`, data)
        },
        onSuccess: (_, { scriptUuid }) => {
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.parts(scriptUuid) })
        },
    })

    return {
        updateScriptCallToAction: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
