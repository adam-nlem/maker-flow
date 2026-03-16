import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { ScriptTag, type ScriptTagJSON } from "~/models/ScriptTag";
import { scriptTagQueryKeys } from "./scriptTagQueryKeys";

export function useListScriptTags({ projectUuid }: { projectUuid: string | null }) {
    const query = useQuery({
        queryKey: scriptTagQueryKeys.list(projectUuid ?? ''),
        queryFn: async () => {
            const res = await httpClient.get('/scripts/tags', { params: { projectUuid } })
            return res.data.map((json: ScriptTagJSON) => ScriptTag.fromJSON(json)) as ScriptTag[]
        },
        enabled: !!projectUuid,
    })

    return {
        scriptTags: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error,
    }
}
