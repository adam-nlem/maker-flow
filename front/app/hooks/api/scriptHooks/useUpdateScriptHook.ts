import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { scriptQueryKeys } from "../scripts/scriptQueryKeys";

interface UpdateScriptHookData {
    content?: string;
    hookTemplateUuid?: string | null;
}

interface UpdateScriptHookParams {
    hookUuid: string;
    scriptUuid: string;
    data: UpdateScriptHookData;
}

export function useUpdateScriptHook() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async ({ hookUuid, data }: UpdateScriptHookParams) => {
            await httpClient.patch(`/scripts/hooks/${hookUuid}`, data)
        },
        onSuccess: (_, { scriptUuid }) => {
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.parts(scriptUuid) })
        },
    })

    return {
        updateScriptHook: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
