import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { ScriptVersion, type ScriptVersionJSON } from "~/models/ScriptVersion";
import { scriptVersionQueryKeys } from "./scriptVersionQueryKeys";

interface UseShowScriptVersionProps {
    versionUuid: string | null;
}

export function useShowScriptVersion({ versionUuid }: UseShowScriptVersionProps) {
    const query = useQuery({
        queryKey: scriptVersionQueryKeys.show(versionUuid ?? ''),
        queryFn: async () => {
            const res = await httpClient.get<ScriptVersionJSON>(`/script-versions/${versionUuid}`);
            return ScriptVersion.fromJSON(res.data);
        },
        enabled: !!versionUuid,
    });

    return {
        scriptVersion: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error,
    };
}
