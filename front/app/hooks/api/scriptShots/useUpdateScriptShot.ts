import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { scriptQueryKeys } from "../scripts/scriptQueryKeys";
import type { ShotType } from "~/models/enums/ShotType";

interface UpdateScriptShotData {
    content?: string;
    shotType?: ShotType;
}

interface UpdateScriptShotParams {
    shotUuid: string;
    scriptUuid: string;
    data: UpdateScriptShotData;
}

export function useUpdateScriptShot() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async ({ shotUuid, data }: UpdateScriptShotParams) => {
            await httpClient.patch(`/scripts/shots/${shotUuid}`, data)
        },
        onSuccess: (_, { scriptUuid }) => {
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.parts(scriptUuid) })
        },
    })

    return {
        updateScriptShot: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    }
}
