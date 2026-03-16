import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { scriptQueryKeys } from "../scripts/scriptQueryKeys";

interface CreateScriptTextData {
    scriptUuid: string;
    content: string;
    position?: number;
    generationUuid?: string;
}

export function useCreateScriptText() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (data: CreateScriptTextData) => {
            return await httpClient.post('/scripts/texts', data)
        },
        onSuccess: (_, { scriptUuid }) => {
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.parts(scriptUuid) })
        },
    })

    return {
        createScriptText: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
