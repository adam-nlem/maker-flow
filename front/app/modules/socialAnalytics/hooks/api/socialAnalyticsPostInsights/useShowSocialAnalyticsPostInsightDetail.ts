import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { socialAnalyticsPostInsightQueryKeys } from "./socialAnalyticsPostInsightQueryKeys";
import { SocialAnalyticsPostInsightDetailDTO, type SocialAnalyticsPostInsightDetailDTOJSON } from "~/modules/socialAnalytics/dtos/socialAnalyticsPostInsights/SocialAnalyticsPostInsightDetailDTO";

interface UseShowSocialAnalyticsPostInsightDetailProps {
    postUuid: string;
}

export function useShowSocialAnalyticsPostInsightDetail({
    postUuid,
}: UseShowSocialAnalyticsPostInsightDetailProps) {
    const query = useQuery({
        queryKey: socialAnalyticsPostInsightQueryKeys.detail(postUuid),
        queryFn: async () => {
            const res = await httpClient.get<SocialAnalyticsPostInsightDetailDTOJSON>('/modules/social-analytics/post-insights/detail', {
                params: {
                    postUuid,
                }
            });

            return SocialAnalyticsPostInsightDetailDTO.fromJSON(res.data);
        },
    });

    return {
        detail: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error,
    };
}
