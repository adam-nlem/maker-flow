import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { integrationInsightQueryKeys } from "./integrationInsightQueryKeys";
import {
  IntegrationInsightsOverviewDTO,
  type IntegrationInsightsOverviewDTOJSON,
} from "~/dtos/integrationInsights/IntegrationInsightsOverviewDTO";

export function useListIntegrationInsights({ projectUuid }: { projectUuid: string }) {
  const query = useQuery({
    queryKey: integrationInsightQueryKeys.list(projectUuid),
    queryFn: async () => {
      const res = await httpClient.get<IntegrationInsightsOverviewDTOJSON>('/integration-insights', {
        params: {
          "projectUuid": projectUuid
        }
      })
      return IntegrationInsightsOverviewDTO.fromJSON(res.data)
    },
  })

  return {
    insightsOverview: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
  }
}
