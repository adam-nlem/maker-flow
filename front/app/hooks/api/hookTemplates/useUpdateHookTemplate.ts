import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { hookTemplateQueryKeys } from "./hookTemplateQueryKeys";

interface UpdateHookTemplateData {
    title?: string;
    content?: string;
    isPublic?: boolean;
}

interface UpdateHookTemplateParams {
    hookTemplateUuid: string;
    data: UpdateHookTemplateData;
}

export function useUpdateHookTemplate() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async ({ hookTemplateUuid, data }: UpdateHookTemplateParams) => {
            await httpClient.patch(`/hook-templates/${hookTemplateUuid}`, data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: hookTemplateQueryKeys.all })
        },
    })

    return {
        updateHookTemplate: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
