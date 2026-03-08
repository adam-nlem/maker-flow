import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import type { Color } from "~/models/enums/Color";
import { scriptTagQueryKeys } from "./scriptTagQueryKeys";
import { scriptQueryKeys } from "../scripts/scriptQueryKeys";

interface UpdateScriptTagData {
    tagUuid: string;
    title: string;
    color: Color;
}

export function useUpdateScriptTag() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async ({ tagUuid, title, color }: UpdateScriptTagData) => {
            await httpClient.patch(`/scripts/tags/${tagUuid}`, {
                "title": title,
                "color": color,
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: scriptTagQueryKeys.all })
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.all })
        },
    })

    return {
        updateScriptTag: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    }
}
