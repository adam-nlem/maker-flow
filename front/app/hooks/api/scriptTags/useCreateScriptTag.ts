import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { scriptTagQueryKeys } from "./scriptTagQueryKeys";
import type { Color } from "~/models/enums/Color";

interface CreateScriptTagData {
    projectUuid: string;
    title: string;
    color: Color;
}

export function useCreateScriptTag() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (data: CreateScriptTagData) => {
            await httpClient.post('/scripts/tags', data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: scriptTagQueryKeys.all })
        },
    })

    return {
        createScriptTag: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
