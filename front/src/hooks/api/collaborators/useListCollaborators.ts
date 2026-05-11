import { useQuery } from "@tanstack/react-query"
import { ListAgencyCollaboratorsResponseDTO, type ListAgencyCollaboratorsResponseJSON } from "~/models/dtos/ListAgencyCollaboratorsResponseDTO"
import { httpClient } from "~/services/httpClient/httpClient"
import { collaboratorQueryKeys } from "./collaboratorQueryKeys"

export function useListCollaborators() {
    const query = useQuery({
        queryKey: collaboratorQueryKeys.list(),
        queryFn: async () => {
            const res = await httpClient.get<ListAgencyCollaboratorsResponseJSON>('/agencies/collaborators')
            return ListAgencyCollaboratorsResponseDTO.fromJSON(res.data)
        },
    })

    return {
        agencyCollaborators: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error,
    }
}
