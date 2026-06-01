import { useQuery } from "@tanstack/react-query"
import { Project } from "~/models/Project"
import { httpClient } from "~/services/httpClient/httpClient"
import { projectQueryKeys } from "./projectQueryKeys"

export function useShowProject(projectUuid: string | null | undefined) {
    const query = useQuery({
        queryKey: projectQueryKeys.show(projectUuid ?? ''),
        queryFn: async () => {
            const res = await httpClient.get(`/projects/${projectUuid}`)
            return Project.fromJSON(res.data)
        },
        enabled: Boolean(projectUuid),
        retry: false,
    })

    return {
        project: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error,
    }
}
