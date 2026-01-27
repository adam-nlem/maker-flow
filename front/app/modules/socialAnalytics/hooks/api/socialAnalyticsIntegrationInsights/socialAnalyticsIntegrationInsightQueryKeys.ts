import type { SocialAnalyticsTimePeriod } from "~/modules/socialAnalytics/models/enums/SocialAnalyticsTimePeriod";

export const socialAnalyticsIntegrationInsightQueryKeys = {
    all: ["socialAnalyticsIntegrationInsights"] as const,
    list: (integrationUuid: string) => [...socialAnalyticsIntegrationInsightQueryKeys.all, "list", integrationUuid] as const,
    detail: (integrationUuid: string, timePeriod: SocialAnalyticsTimePeriod) => [...socialAnalyticsIntegrationInsightQueryKeys.all, "detail", integrationUuid, timePeriod] as const,
};
