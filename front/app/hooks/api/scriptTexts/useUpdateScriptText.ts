import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { scriptQueryKeys } from "../scripts/scriptQueryKeys";

interface UpdateScriptTextData {
    content?: string;
}

interface UpdateScriptTextParams {
    textUuid: string;
    scriptUuid: string;
    data: UpdateScriptTextData;
}

export function useUpdateScriptText() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async ({ textUuid, data }: UpdateScriptTextParams) => {
            await httpClient.patch(`/scripts/texts/${textUuid}`, data)
        },
        onSuccess: (_, { scriptUuid }) => {
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.parts(scriptUuid) })
        },
    })

    return {
        updateScriptText: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
