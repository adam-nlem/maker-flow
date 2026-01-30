import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { socialAnalyticsIntegrationInsightQueryKeys } from "./socialAnalyticsIntegrationInsightQueryKeys";
import { SocialAnalyticsIntegrationDetailDTO, type SocialAnalyticsIntegrationDetailDTOJSON } from "~/modules/socialAnalytics/dtos/socialAnalyticsIntegrationInsights/SocialAnalyticsIntegrationDetailDTO";

interface UseShowSocialAnalyticsIntegrationDetailProps {
    integrationUuid: string;
}

export function useShowSocialAnalyticsIntegrationDetail({
    integrationUuid,
}: UseShowSocialAnalyticsIntegrationDetailProps) {
    const query = useQuery({
        queryKey: socialAnalyticsIntegrationInsightQueryKeys.detail(integrationUuid),
        queryFn: async () => {
            const res = await httpClient.get<SocialAnalyticsIntegrationDetailDTOJSON>('/modules/social-analytics/integration-insights/detail', {
                params: {
                    integrationUuid,
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
