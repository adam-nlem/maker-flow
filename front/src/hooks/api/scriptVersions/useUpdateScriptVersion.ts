import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { ScriptVersion, type ScriptVersionJSON } from "~/models/ScriptVersion";
import type { ScriptVersionStatus } from "~/models/enums/ScriptVersionStatus";
import { scriptVersionQueryKeys } from "./scriptVersionQueryKeys";
import { scriptQueryKeys } from "~/hooks/api/scripts/scriptQueryKeys";

interface UpdateScriptVersionData {
    versionUuid: string;
    scriptUuid: string;
    status: ScriptVersionStatus;
}

export function useUpdateScriptVersion() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (data: UpdateScriptVersionData) => {
            const res = await httpClient.patch<ScriptVersionJSON>(`/script-versions/${data.versionUuid}`, {
                status: data.status,
            });
            return ScriptVersion.fromJSON(res.data);
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: scriptVersionQueryKeys.show(variables.versionUuid) });
            queryClient.invalidateQueries({ queryKey: scriptQueryKeys.parts(variables.scriptUuid) });
        },
    });

    return {
        updateScriptVersion: mutation.mutateAsync,
        isPending: mutation.isPending,
    };
}
