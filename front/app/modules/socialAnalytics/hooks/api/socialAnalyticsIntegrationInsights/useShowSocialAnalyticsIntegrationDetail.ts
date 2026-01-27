import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { socialAnalyticsIntegrationInsightQueryKeys } from "./socialAnalyticsIntegrationInsightQueryKeys";

import type { SocialAnalyticsTimePeriod } from "~/modules/socialAnalytics/models/enums/SocialAnalyticsTimePeriod";
import { SocialAnalyticsIntegrationDetailDTO } from "~/modules/socialAnalytics/dtos/socialAnalyticsIntegrationInsights/SocialAnalyticsIntegrationDetailDTO";
interface UseShowSocialAnalyticsIntegrationDetailProps {
    integrationUuid: string;
    timePeriod: SocialAnalyticsTimePeriod;
}

export function useShowSocialAnalyticsIntegrationDetail({
    integrationUuid,
    timePeriod
}: UseShowSocialAnalyticsIntegrationDetailProps) {
    const query = useQuery({
        queryKey: socialAnalyticsIntegrationInsightQueryKeys.detail(integrationUuid, timePeriod),
        queryFn: async () => {
            const res = await httpClient.get<SocialAnalyticsIntegrationDetailDTO>('/modules/social-analytics/integration-insights/detail', {
                params: {
                    integrationUuid,
                    timePeriod,
                }
            });
            return SocialAnalyticsIntegrationDetailDTO.fromJSON(res.data);
        },
    });

    return {
        detail: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error,
    };
}
