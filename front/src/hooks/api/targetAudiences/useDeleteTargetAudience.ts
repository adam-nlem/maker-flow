import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { targetAudienceQueryKeys } from "./targetAudienceQueryKeys";

interface DeleteTargetAudienceData {
    targetAudienceUuid: string;
    projectUuid: string;
}

export function useDeleteTargetAudience() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (data: DeleteTargetAudienceData) => {
            await httpClient.delete(`/target-audiences/${data.targetAudienceUuid}`);
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: targetAudienceQueryKeys.list(variables.projectUuid) });
        },
    });

    return {
        deleteTargetAudience: mutation.mutateAsync,
        isPending: mutation.isPending,
    };
}
