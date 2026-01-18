import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { socialAnalyticsInsightQueryKeys } from "./socialAnalyticsInsightQueryKeys";
import { SocialAnalyticsInsight, type SocialAnalyticsInsightJSON } from "~/modules/socialAnalytics/models/SocialAnalyticsInsight";


export function useListSocialAnalyticsInsights({ integrationUuid }: { integrationUuid: string }) {
    const query = useQuery({
        queryKey: socialAnalyticsInsightQueryKeys.list(integrationUuid),
        queryFn: async () => {
            const res = await httpClient.get('/modules/social-analytics/insights', {
                params: {
                    "integrationUuid": integrationUuid
                }
            })
            return res.data.map((json: SocialAnalyticsInsightJSON) => SocialAnalyticsInsight.fromJSON(json)) as SocialAnalyticsInsight[]
        },
    })

    return {
        socialAnalyticsInsights: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error,
    }
}