import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { hookTemplateQueryKeys } from "./hookTemplateQueryKeys";

export function useDeleteHookTemplate() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (hookTemplateUuid: string) => {
            await httpClient.delete(`/hook-templates/${hookTemplateUuid}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: hookTemplateQueryKeys.all })
        },
    })

    return {
        deleteHookTemplate: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
