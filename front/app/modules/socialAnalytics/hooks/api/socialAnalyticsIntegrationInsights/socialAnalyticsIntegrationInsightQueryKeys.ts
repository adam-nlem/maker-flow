export const socialAnalyticsIntegrationInsightQueryKeys = {
    all: ["socialAnalyticsIntegrationInsights"] as const,
    list: (integrationUuid: string) => [...socialAnalyticsIntegrationInsightQueryKeys.all, "list", integrationUuid] as const,
    detail: (integrationUuid: string) => [...socialAnalyticsIntegrationInsightQueryKeys.all, "detail", integrationUuid] as const,
};
