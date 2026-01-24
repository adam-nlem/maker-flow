import type { SocialAnalyticsTimePeriod } from "~/modules/socialAnalytics/models/enums/SocialAnalyticsTimePeriod";

export const socialAnalyticsIntegrationInsightQueryKeys = {
    all: ["socialAnalyticsIntegrationInsight"] as const,
    list: (integrationUuid: string) => [...socialAnalyticsIntegrationInsightQueryKeys.all, "list", integrationUuid] as const,
    overview: (integrationUuid: string, timePeriod: SocialAnalyticsTimePeriod) => [...socialAnalyticsIntegrationInsightQueryKeys.all, "overview", integrationUuid, timePeriod] as const,
};
