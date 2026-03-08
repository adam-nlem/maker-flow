import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import type { Script } from "~/models/Script";
import { scriptQueryKeys } from "./scriptQueryKeys";

export function useDeleteScript() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (scriptUuid: string) => {
            await httpClient.delete(`/scripts/${scriptUuid}`)
        },
        onSuccess: (_data, deletedScriptUuid) => {
            queryClient.removeQueries({ queryKey: scriptQueryKeys.parts(deletedScriptUuid) });
            queryClient.setQueriesData<Script[]>(
                { queryKey: ['scripts', 'list'] },
                (old) => old?.filter(s => s.uuid !== deletedScriptUuid)
            );
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.all });
        },
    })

    return {
        deleteScript: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
