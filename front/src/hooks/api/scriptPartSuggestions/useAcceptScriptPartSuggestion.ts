import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { ScriptPartSuggestion, type ScriptPartSuggestionJSON } from "~/models/ScriptPartSuggestion";
import { scriptPartSuggestionQueryKeys } from "./scriptPartSuggestionQueryKeys";
import { scriptQueryKeys } from "../scripts/scriptQueryKeys";
import { chatMessageQueryKeys } from "../chatMessages/chatMessageQueryKeys";

interface AcceptScriptPartSuggestionInput {
    suggestionUuid: string;
    scriptUuid: string;
    chatUuid?: string;
}

export function useAcceptScriptPartSuggestion() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async ({ suggestionUuid }: AcceptScriptPartSuggestionInput) => {
            const res = await httpClient.post(`/script-part-suggestions/${suggestionUuid}/accept`);
            return ScriptPartSuggestion.fromJSON(res.data as ScriptPartSuggestionJSON);
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: scriptPartSuggestionQueryKeys.all });
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.parts(variables.scriptUuid) });
            if (variables.chatUuid) {
                queryClient.invalidateQueries({ queryKey: chatMessageQueryKeys.list(variables.chatUuid) });
            }
        },
    });

    return {
        acceptScriptPartSuggestion: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    };
}
