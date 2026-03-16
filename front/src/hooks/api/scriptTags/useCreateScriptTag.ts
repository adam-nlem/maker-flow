import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { scriptTagQueryKeys } from "./scriptTagQueryKeys";
import { ScriptTag } from "~/models/ScriptTag";
import type { Color } from "~/models/enums/Color";

interface CreateScriptTagData {
    title: string;
    color: Color;
}

export function useCreateScriptTag({ projectUuid }: { projectUuid: string }) {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (data: CreateScriptTagData) => {
            const res = await httpClient.post('/scripts/tags', {
                "projectUuid": projectUuid,
                "title": data.title,
                "color": data.color,
            })
            return ScriptTag.fromJSON(res.data);
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
