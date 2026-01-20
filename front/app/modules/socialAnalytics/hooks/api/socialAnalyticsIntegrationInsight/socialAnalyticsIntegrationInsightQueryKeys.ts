export const socialAnalyticsIntegrationInsightQueryKeys = {
    all: ["socialAnalyticsIntegrationInsight"] as const,
    list: (integrationUuid: string) => [...socialAnalyticsIntegrationInsightQueryKeys.all, "list", integrationUuid] as const,
};
