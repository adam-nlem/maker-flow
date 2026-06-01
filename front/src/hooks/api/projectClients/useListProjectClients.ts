import { useQuery } from "@tanstack/react-query"
import { ListProjectClientsResponseDTO, type ListProjectClientsResponseJSON } from "~/models/dtos/ListProjectClientsResponseDTO"
import { httpClient } from "~/services/httpClient/httpClient"
import { projectClientQueryKeys } from "./projectClientQueryKeys"

export function useListProjectClients(projectUuid: string | null) {
    const query = useQuery({
        queryKey: projectClientQueryKeys.list(projectUuid ?? ''),
        queryFn: async () => {
            const res = await httpClient.get<ListProjectClientsResponseJSON>('/projects/clients', { params: { projectUuid } })
            return ListProjectClientsResponseDTO.fromJSON(res.data)
        },
        enabled: !!projectUuid,
    })

    return {
        projectClients: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error,
    }
}
