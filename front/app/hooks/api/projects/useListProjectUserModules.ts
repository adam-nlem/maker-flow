import { useQuery } from "@tanstack/react-query";
import { UserModule, type UserModuleJSON } from "~/models/UserModule";
import { httpClient } from "~/services/httpClient/httpClient";
import { projectQueryKeys } from "./projectQueryKeys";

export function useListProjectUserModules(projectUuid?: string) {
  const query = useQuery({
    queryKey: projectQueryKeys.userModules(projectUuid ?? ''),
    queryFn: async () => {
      const res = await httpClient.get(`/projects/${projectUuid}/user-modules`)
      return res.data.map((json: UserModuleJSON) => UserModule.fromJSON(json)) as UserModule[]
    },
    enabled: !!projectUuid,
  })

  return {
    userModules: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  }
}
