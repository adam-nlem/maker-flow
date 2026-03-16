import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { scriptQueryKeys } from "../scripts/scriptQueryKeys";

interface CreateScriptHookData {
    scriptUuid: string;
    content: string;
    generationUuid?: string;
    hookTemplateUuid?: string;
}

export function useCreateScriptHook() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (data: CreateScriptHookData) => {
            return await httpClient.post('/scripts/hooks', data)
        },
        onSuccess: (_, { scriptUuid }) => {
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.parts(scriptUuid) })
        },
    })

    return {
        createScriptHook: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
