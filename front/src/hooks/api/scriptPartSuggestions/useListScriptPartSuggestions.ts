import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { ScriptPartSuggestion, type ScriptPartSuggestionJSON } from "~/models/ScriptPartSuggestion";
import { ScriptPartSuggestionStatus } from "~/models/enums/ScriptPartSuggestionStatus";
import { scriptPartSuggestionQueryKeys } from "./scriptPartSuggestionQueryKeys";

interface UseListScriptPartSuggestionsInput {
    scriptUuid: string | null;
    status?: ScriptPartSuggestionStatus;
}

export function useListScriptPartSuggestions({ scriptUuid, status }: UseListScriptPartSuggestionsInput) {
    const query = useQuery({
        queryKey: scriptPartSuggestionQueryKeys.list(scriptUuid ?? '', status),
        queryFn: async () => {
            const params: Record<string, string> = { scriptUuid: scriptUuid ?? '' };
            if (status) params.status = status;

            const res = await httpClient.get('/script-part-suggestions', { params });
            return (res.data as ScriptPartSuggestionJSON[]).map((json) => ScriptPartSuggestion.fromJSON(json));
        },
        enabled: !!scriptUuid,
    });

    return {
        suggestions: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error,
    };
}
