import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { Script, type ScriptJSON } from "~/models/Script";
import { scriptQueryKeys } from "./scriptQueryKeys";

export function useListScripts({ projectUuid }: { projectUuid: string }) {
    const query = useQuery({
        queryKey: scriptQueryKeys.list(projectUuid),
        queryFn: async () => {
            const res = await httpClient.get('/scripts', { params: { projectUuid } })
            return res.data.map((json: ScriptJSON) => Script.fromJSON(json)) as Script[]
        },
    })

    return {
        scripts: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error,
    }
}
