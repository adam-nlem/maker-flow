import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ProjectType } from "~/models/enums/ProjectType";
import { Project } from "~/models/Project";
import { httpClient } from "~/services/httpClient/httpClient";
import { AnalyticsEvent } from "~/models/enums/AnalyticsEvent";
import { track } from "~/services/analytics/analytics";
import { validateLogo } from "~/utils/logoValidation";
import { projectQueryKeys } from "./projectQueryKeys";

interface CreateProjectData {
  name: string;
  description?: string;
  types: ProjectType[];
  logo: File | null;
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const [validationErrorKey, setValidationErrorKey] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (data: { name: string; description?: string; types: ProjectType[]; logo: File }) => {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.description && data.description.trim()) {
        formData.append("description", data.description.trim());
      }
      data.types.forEach((type) => formData.append("types[]", type));
      formData.append("logo", data.logo);

      const res = await httpClient.post("/projects", formData);
      return Project.fromJSON(res.data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.all });
      track(AnalyticsEvent.ProjectCreated, { project_types: variables.types });
    },
  });

  const createProject = async ({ name, description, types, logo }: CreateProjectData): Promise<Project | undefined> => {
    if (!name.trim()) {
      setValidationErrorKey("projects:create.validation.nameRequired");
      return;
    }

    const logoError = validateLogo(logo);
    if (logoError || !logo) {
      setValidationErrorKey(logoError);
      return;
    }

    setValidationErrorKey(null);
    return mutation.mutateAsync({ name: name.trim(), description, types, logo });
  };

  const clearValidationError = () => setValidationErrorKey(null);

  return {
    createProject,
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
    validationErrorKey,
    clearValidationError,
  };
}
