import type { ScriptPartSuggestionStatus } from "~/models/enums/ScriptPartSuggestionStatus";

export const scriptPartSuggestionQueryKeys = {
    all: ['scriptPartSuggestions'] as const,
    list: (scriptUuid: string, status?: ScriptPartSuggestionStatus) =>
        [...scriptPartSuggestionQueryKeys.all, 'list', scriptUuid, ...(status ? [status] : [])] as const,
};
