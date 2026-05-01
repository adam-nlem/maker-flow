import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { ScriptPart, type ScriptPartJSON } from "~/models/ScriptPart";
import { scriptQueryKeys } from "./scriptQueryKeys";

export function useListScriptParts({ scriptUuid }: { scriptUuid: string | null }) {
    const query = useQuery({
        queryKey: scriptQueryKeys.parts(scriptUuid ?? ''),
        queryFn: async () => {
            const res = await httpClient.get('/script-parts', {
                params: { scriptUuid },
            });
            return (res.data as ScriptPartJSON[]).map((json) => ScriptPart.fromJSON(json));
        },
        enabled: !!scriptUuid,
    });

    return {
        parts: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error,
    };
}
