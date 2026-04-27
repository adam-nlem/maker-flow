import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { ScriptPart, type ScriptPartJSON } from "~/models/ScriptPart";
import type { ScriptPartType } from "~/models/enums/ScriptPartType";
import { scriptQueryKeys } from "./scriptQueryKeys";

interface UpdateScriptPartInput {
    scriptUuid: string;
    partUuid: string;
    content?: string;
    type?: ScriptPartType;
    position?: number;
}

export function useUpdateScriptPart() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async ({ partUuid, content, type, position }: UpdateScriptPartInput) => {
            const payload: Record<string, unknown> = {};
            if (content !== undefined) payload.content = content;
            if (type !== undefined) payload.type = type;
            if (position !== undefined) payload.position = position;

            const res = await httpClient.patch(`/script-parts/${partUuid}`, payload);
            return ScriptPart.fromJSON(res.data as ScriptPartJSON);
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.parts(variables.scriptUuid) });
        },
    });

    return {
        updateScriptPart: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    };
}
