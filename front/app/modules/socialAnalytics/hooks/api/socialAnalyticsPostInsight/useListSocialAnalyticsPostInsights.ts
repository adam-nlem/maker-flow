import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { socialAnalyticsPostInsightQueryKeys } from "./socialAnalyticsPostInsightQueryKeys";
import { SocialAnalyticsPostInsight, type SocialAnalyticsPostInsightJSON } from "~/modules/socialAnalytics/models/SocialAnalyticsPostInsight";


export function useListSocialAnalyticsPostInsights({ postUuid }: { postUuid: string }) {
    const query = useQuery({
        queryKey: socialAnalyticsPostInsightQueryKeys.list(postUuid),
        queryFn: async () => {
            const res = await httpClient.get('/modules/social-analytics/post-insights', {
                params: {
                    "postUuid": postUuid
                }
            })
            return res.data.map((json: SocialAnalyticsPostInsightJSON) => SocialAnalyticsPostInsight.fromJSON(json)) as SocialAnalyticsPostInsight[]
        },
    })

    return {
        socialAnalyticsPostInsights: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error,
    }
}
