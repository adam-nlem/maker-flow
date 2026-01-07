import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ProjectType } from "~/models/enums/ProjectType";
import { Project } from "~/models/Project";
import { httpClient } from "~/services/httpClient/httpClient";
import { projectQueryKeys } from "./projectQueryKeys";

interface CreateProjectData {
  name: string;
  description: string;
  types: ProjectType[];
}

export function useCreateProject() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (data: CreateProjectData) => {
      const res = await httpClient.post('/projects', {
        "name": data.name,
        "description": data.description,
        "types": data.types
      })
      return Project.fromJSON(res.data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.all })
    },
  })

  return {
    createProject: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  }
}
