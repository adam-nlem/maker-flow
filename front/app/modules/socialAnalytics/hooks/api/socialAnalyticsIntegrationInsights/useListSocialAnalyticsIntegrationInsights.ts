import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { socialAnalyticsIntegrationInsightQueryKeys } from "./socialAnalyticsIntegrationInsightQueryKeys";
import { SocialAnalyticsIntegrationInsight, type SocialAnalyticsIntegrationInsightJSON } from "~/modules/socialAnalytics/models/SocialAnalyticsIntegrationInsight";


export function useListSocialAnalyticsIntegrationInsights({ integrationUuid }: { integrationUuid: string }) {
    const query = useQuery({
        queryKey: socialAnalyticsIntegrationInsightQueryKeys.list(integrationUuid),
        queryFn: async () => {
            const res = await httpClient.get('/modules/social-analytics/integration-insights', {
                params: {
                    "integrationUuid": integrationUuid
                }
            })
            return res.data.map((json: SocialAnalyticsIntegrationInsightJSON) => SocialAnalyticsIntegrationInsight.fromJSON(json)) as SocialAnalyticsIntegrationInsight[]
        },
    })

    return {
        socialAnalyticsIntegrationInsights: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error,
    }
}
