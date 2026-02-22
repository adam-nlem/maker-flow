import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { scriptQueryKeys } from "./scriptQueryKeys";

interface UpdateScriptData {
    title?: string;
    hook?: string | null;
    publishedAt?: Date | null;
    postGroupUuid?: string | null;
    hookTemplateUuid?: string | null;
    tagUuids?: string[];
    platforms?: string[] | null;
    status?: string | null;
}

interface UpdateScriptParams {
    scriptUuid: string;
    data: UpdateScriptData
}

export function useUpdateScript() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async ({ scriptUuid, data }: UpdateScriptParams) => {
            await httpClient.patch(`/scripts/${scriptUuid}`, {
                ...data,
                publishedAt: data.publishedAt !== undefined
                    ? (data.publishedAt ? data.publishedAt.toLocaleDateString('sv-SE') : null)
                    : undefined,
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.all })
        },
    })

    return {
        updateScript: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
