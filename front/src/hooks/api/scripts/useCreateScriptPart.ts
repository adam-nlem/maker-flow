import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { ScriptPart, type ScriptPartJSON } from "~/models/ScriptPart";
import { ScriptPartType } from "~/models/enums/ScriptPartType";
import { scriptQueryKeys } from "./scriptQueryKeys";

interface CreateScriptPartInput {
    scriptUuid: string;
    content: string;
    type?: ScriptPartType;
    position?: number;
}

export function useCreateScriptPart() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async ({ scriptUuid, content, type, position }: CreateScriptPartInput) => {
            const res = await httpClient.post('/script-parts', {
                scriptUuid,
                content,
                type: type ?? ScriptPartType.Text,
                ...(position !== undefined && { position }),
            });
            return ScriptPart.fromJSON(res.data as ScriptPartJSON);
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.parts(variables.scriptUuid) });
        },
    });

    return {
        createScriptPart: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    };
}
