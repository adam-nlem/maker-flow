import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { ListScriptsGroupedByDayDTO, type ListScriptsGroupedByDayDTOJSON } from "~/models/dtos/ListScriptsGroupedByDayDTO";
import { scriptQueryKeys } from "./scriptQueryKeys";

interface UseListCalendarScriptsProps {
    projectUuid: string;
    year: number;
    month: number;
}

export function useListCalendarScripts({ projectUuid, year, month }: UseListCalendarScriptsProps) {
    const query = useQuery({
        queryKey: scriptQueryKeys.calendar(projectUuid, year, month),
        queryFn: async () => {
            const res = await httpClient.get<ListScriptsGroupedByDayDTOJSON[]>('/scripts/calendar', {
                params: { projectUuid, year, month },
            });
            return res.data.map((json) => ListScriptsGroupedByDayDTO.fromJSON(json));
        },
    });

    return {
        scriptsByDay: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error,
    };
}
