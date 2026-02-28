import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { type ScriptPart, type ScriptPartJSON, scriptPartFromJSON } from "~/models/ScriptPart";
import { scriptQueryKeys } from "./scriptQueryKeys";

export function useListScriptParts({ scriptUuid, generationUuid }: { scriptUuid: string; generationUuid?: string }) {
    const query = useQuery({
        queryKey: scriptQueryKeys.parts(scriptUuid, generationUuid),
        queryFn: async () => {
            const res = await httpClient.get(`/scripts/${scriptUuid}/parts`, {
                params: generationUuid ? { generationUuid } : undefined,
            })
            return res.data.map((json: ScriptPartJSON) => scriptPartFromJSON(json)) as ScriptPart[]
        },
    })

    return {
        parts: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error,
    }
}
