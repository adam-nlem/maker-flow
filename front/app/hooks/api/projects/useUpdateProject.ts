import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { projectQueryKeys } from "./projectQueryKeys";
import type { ProjectType } from "~/models/enums/ProjectType";

interface UpdateProjectData {
    projectUuid: string;
    name: string;
    description: string;
    types: ProjectType[];
}

export function useUpdateProject() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async (data: UpdateProjectData) => {
            await httpClient.patch(
                `/projects/${data.projectUuid}`,
                {
                    "name": data.name,
                    "description": data.description,
                    "types": data.types
                }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectQueryKeys.all })
        },
    })

    return {
        updateProject: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
        reset: mutation.reset,
    };
}
