import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { HookTemplate, type HookTemplateJSON } from "~/models/HookTemplate";
import { hookTemplateQueryKeys } from "./hookTemplateQueryKeys";

interface CreateHookTemplateData {
    title: string;
    content: string;
    isPublic?: boolean;
}

export function useCreateHookTemplate() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (data: CreateHookTemplateData): Promise<HookTemplate> => {
            const res = await httpClient.post('/hook-templates', data)
            return HookTemplate.fromJSON(res.data as HookTemplateJSON)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: hookTemplateQueryKeys.all })
        },
    })

    return {
        createHookTemplate: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
