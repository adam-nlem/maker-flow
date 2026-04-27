import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { ScriptPartSuggestion, type ScriptPartSuggestionJSON } from "~/models/ScriptPartSuggestion";
import { scriptPartSuggestionQueryKeys } from "./scriptPartSuggestionQueryKeys";
import { chatMessageQueryKeys } from "../chatMessages/chatMessageQueryKeys";

interface RejectScriptPartSuggestionInput {
    suggestionUuid: string;
    scriptUuid: string;
    chatUuid?: string;
}

export function useRejectScriptPartSuggestion() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async ({ suggestionUuid }: RejectScriptPartSuggestionInput) => {
            const res = await httpClient.post(`/script-part-suggestions/${suggestionUuid}/reject`);
            return ScriptPartSuggestion.fromJSON(res.data as ScriptPartSuggestionJSON);
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: scriptPartSuggestionQueryKeys.all });
            if (variables.chatUuid) {
                queryClient.invalidateQueries({ queryKey: chatMessageQueryKeys.list(variables.chatUuid) });
            }
        },
    });

    return {
        rejectScriptPartSuggestion: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    };
}
