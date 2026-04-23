import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { ScriptVersion, type ScriptVersionJSON } from "~/models/ScriptVersion";
import { scriptQueryKeys } from "~/hooks/api/scripts/scriptQueryKeys";

interface ApplyHookSuggestionData {
    chatUuid: string;
    messageUuid: string;
    hookContent: string;
    scriptUuid: string;
}

export function useApplyHookSuggestion() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (data: ApplyHookSuggestionData) => {
            const res = await httpClient.post<ScriptVersionJSON>('/script-versions/apply-hook-suggestion', {
                chatUuid: data.chatUuid,
                messageUuid: data.messageUuid,
                hookContent: data.hookContent,
            });
            return ScriptVersion.fromJSON(res.data);
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.parts(variables.scriptUuid) });
        },
    });

    return {
        applyHookSuggestion: mutation.mutateAsync,
        isPending: mutation.isPending,
    };
}
