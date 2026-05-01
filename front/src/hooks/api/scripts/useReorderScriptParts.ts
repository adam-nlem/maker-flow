import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { scriptQueryKeys } from "./scriptQueryKeys";

interface OrderedPart {
    uuid: string;
    type: string;
}

interface ReorderScriptPartsData {
    scriptUuid: string;
    orderedParts: OrderedPart[];
}

export function useReorderScriptParts() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async ({ scriptUuid, orderedParts }: ReorderScriptPartsData) => {
            await httpClient.patch('/script-parts/reorder', { scriptUuid, orderedParts })
        },
        onSuccess: (_, { scriptUuid }) => {
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.parts(scriptUuid) })
        },
    })

    return {
        reorderScriptParts: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
