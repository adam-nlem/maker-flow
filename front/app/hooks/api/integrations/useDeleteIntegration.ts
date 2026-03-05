import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { integrationQueryKeys } from "./integrationQueryKeys";

export function useDeleteIntegration({ projectUuid }: { projectUuid: string }) {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (integrationUuid: string) => {
            await httpClient.delete(`/integrations/${integrationUuid}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: integrationQueryKeys.list(projectUuid) });
        },
    });

    return {
        deleteIntegration: mutation.mutateAsync,
        isPending: mutation.isPending,
    };
}
