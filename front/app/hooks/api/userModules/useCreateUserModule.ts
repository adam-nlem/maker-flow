import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserModule } from "~/models/UserModule";
import { httpClient } from "~/services/httpClient/httpClient";
import { projectQueryKeys } from "../projects/projectQueryKeys";

interface CreateUserModuleData {
  moduleUuid: string;
  projectUuid: string;
}

export function useCreateUserModule() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({ moduleUuid, projectUuid }: CreateUserModuleData) => {
      const res = await httpClient.post('/user-modules', {
        "moduleUuid": moduleUuid,
        "projectUuid": projectUuid
      })
      return UserModule.fromJSON(res.data)
    },
    onSuccess: (_, { projectUuid }) => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.userModules(projectUuid) })
    },
  })

  return {
    createUserModule: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  }
}
