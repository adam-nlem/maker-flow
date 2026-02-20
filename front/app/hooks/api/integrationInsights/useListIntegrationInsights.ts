import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { integrationInsightQueryKeys } from "./integrationInsightQueryKeys";
import { IntegrationInsight, type IntegrationInsightJSON } from "~/models/IntegrationInsight";


export function useListIntegrationInsights({ integrationUuid }: { integrationUuid: string }) {
  const query = useQuery({
    queryKey: integrationInsightQueryKeys.list(integrationUuid),
    queryFn: async () => {
      const res = await httpClient.get('/integration-insights', {
        params: {
          "integrationUuid": integrationUuid
        }
      })
      return res.data.map((json: IntegrationInsightJSON) => IntegrationInsight.fromJSON(json)) as IntegrationInsight[]
    },
  })

  return {
    integrationInsights: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  }
}
