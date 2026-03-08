import { useQuery } from "@tanstack/react-query";
import { ScriptsGroupedByStatusDTO, type ScriptsGroupedByStatusDTOJSON } from "~/dtos/scripts/ScriptsGroupedByStatusDTO";
import { httpClient } from "~/services/httpClient/httpClient";
import { scriptQueryKeys } from "./scriptQueryKeys";

interface UseListScriptsByStatusProps {
    projectUuid: string;
}

export function useListScriptsByStatus({ projectUuid }: UseListScriptsByStatusProps) {
    const query = useQuery({
        queryKey: scriptQueryKeys.byStatus(projectUuid),
        queryFn: async () => {
            const res = await httpClient.get<ScriptsGroupedByStatusDTOJSON[]>(`/scripts/by-status`, {
                params: { projectUuid },
            });

            return res.data.map((json) => ScriptsGroupedByStatusDTO.fromJSON(json));
        },
    });

    return {
        scriptsByStatus: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error,
    };
}
