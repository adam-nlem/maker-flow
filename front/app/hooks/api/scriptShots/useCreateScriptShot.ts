import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { scriptQueryKeys } from "../scripts/scriptQueryKeys";
import type { ShotType } from "~/models/enums/ShotType";

interface CreateScriptShotData {
    scriptUuid: string;
    content: string;
    shotType?: ShotType;
}

export function useCreateScriptShot() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (data: CreateScriptShotData) => {
            await httpClient.post('/scripts/shots', data)
        },
        onSuccess: (_, { scriptUuid }) => {
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.parts(scriptUuid) })
        },
    })

    return {
        createScriptShot: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
