import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { integrationInsightQueryKeys } from "./integrationInsightQueryKeys";
import {
  IntegrationInsightsResponseDTO,
  type IntegrationInsightsResponseDTOJSON,
} from "~/dtos/integrationInsights/IntegrationInsightsResponseDTO";

interface UseListIntegrationInsightsProps {
  projectUuid: string | null;
  timePeriod: string;
}

export function useListIntegrationInsights({ projectUuid, timePeriod }: UseListIntegrationInsightsProps) {
  const query = useQuery({
    queryKey: integrationInsightQueryKeys.list(projectUuid ?? '', timePeriod),
    queryFn: async () => {
      const res = await httpClient.get<IntegrationInsightsResponseDTOJSON>('/integration-insights', {
        params: {
          projectUuid,
          timePeriod,
        },
      })
      return IntegrationInsightsResponseDTO.fromJSON(res.data)
    },
    enabled: !!projectUuid,
  })

  return {
    integrationInsights: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
  }
}
