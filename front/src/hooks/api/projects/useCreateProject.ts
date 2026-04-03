import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ProjectType } from "~/models/enums/ProjectType";
import { Project } from "~/models/Project";
import { httpClient } from "~/services/httpClient/httpClient";
import { AnalyticsEvent } from "~/models/enums/AnalyticsEvent";
import { track } from "~/services/analytics/analytics";
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.all })
      track(AnalyticsEvent.ProjectCreated, { project_types: variables.types })
    },
  })

  return {
    createProject: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  }
}
