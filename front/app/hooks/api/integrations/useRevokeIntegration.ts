import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { integrationQueryKeys } from "./integrationQueryKeys";

export function useRevokeIntegration({ projectUuid }: { projectUuid: string }) {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (integrationUuid: string) => {
            await httpClient.delete(`/integrations/${integrationUuid}/tokens`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: integrationQueryKeys.list(projectUuid) });
        },
    });

    return {
        revokeIntegration: mutation.mutateAsync,
        isPending: mutation.isPending,
    };
}
