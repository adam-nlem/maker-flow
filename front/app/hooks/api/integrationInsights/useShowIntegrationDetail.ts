import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { integrationInsightQueryKeys } from "./integrationInsightQueryKeys";
import { IntegrationDetailDTO, type IntegrationDetailDTOJSON } from "~/dtos/integrationInsights/IntegrationDetailDTO";

interface UseShowIntegrationDetailProps {
    integrationUuid: string;
}

export function useShowIntegrationDetail({
    integrationUuid,
}: UseShowIntegrationDetailProps) {
    const query = useQuery({
        queryKey: integrationInsightQueryKeys.detail(integrationUuid),
        queryFn: async () => {
            const res = await httpClient.get<IntegrationDetailDTOJSON>('/integration-insights/detail', {
                params: {
                    integrationUuid,
                }
            });

            return IntegrationDetailDTO.fromJSON(res.data);
        },
    });

    return {
        detail: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error,
    };
}
