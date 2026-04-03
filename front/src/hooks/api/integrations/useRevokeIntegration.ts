import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { AnalyticsEvent } from "~/models/enums/AnalyticsEvent";
import { track } from "~/services/analytics/analytics";
import { integrationQueryKeys } from "./integrationQueryKeys";

export function useRevokeIntegration({ projectUuid }: { projectUuid: string }) {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (integrationUuid: string) => {
            await httpClient.delete(`/integrations/${integrationUuid}/tokens`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: integrationQueryKeys.list(projectUuid) });
            track(AnalyticsEvent.IntegrationRevoked)
        },
    });

    return {
        revokeIntegration: mutation.mutateAsync,
        isPending: mutation.isPending,
    };
}
