export const socialAnalyticsInsightQueryKeys = {
    all: ["socialAnalyticsInsight"] as const,
    list: (integrationUuid: string) => [...socialAnalyticsInsightQueryKeys.all, "list", integrationUuid] as const,
};
