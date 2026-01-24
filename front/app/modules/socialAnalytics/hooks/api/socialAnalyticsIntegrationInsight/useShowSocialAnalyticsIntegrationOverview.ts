import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { socialAnalyticsIntegrationInsightQueryKeys } from "./socialAnalyticsIntegrationInsightQueryKeys";
import { SocialAnalyticsIntegrationOverviewDTO, type SocialAnalyticsIntegrationOverviewDTOJSON } from "~/modules/socialAnalytics/models/dtos/SocialAnalyticsIntegrationOverviewDTO";
import type { SocialAnalyticsTimePeriod } from "~/modules/socialAnalytics/models/enums/SocialAnalyticsTimePeriod";

interface UseShowSocialAnalyticsIntegrationOverviewProps {
    integrationUuid: string;
    timePeriod: SocialAnalyticsTimePeriod;
}

export function useShowSocialAnalyticsIntegrationOverview({ 
    integrationUuid, 
    timePeriod 
}: UseShowSocialAnalyticsIntegrationOverviewProps) {
    const query = useQuery({
        queryKey: socialAnalyticsIntegrationInsightQueryKeys.overview(integrationUuid, timePeriod),
        queryFn: async () => {
            const res = await httpClient.get<SocialAnalyticsIntegrationOverviewDTOJSON>('/modules/social-analytics/integration-insights/overview', {
                params: {
                    integrationUuid,
                    timePeriod,
                }
            });
            return SocialAnalyticsIntegrationOverviewDTO.fromJSON(res.data);
        },
    });

    return {
        overview: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error,
    };
}
