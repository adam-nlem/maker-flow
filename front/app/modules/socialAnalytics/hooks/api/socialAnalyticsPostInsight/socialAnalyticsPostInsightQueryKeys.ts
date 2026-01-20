export const socialAnalyticsPostInsightQueryKeys = {
    all: ["socialAnalyticsPostInsight"] as const,
    list: (postUuid: string) => [...socialAnalyticsPostInsightQueryKeys.all, "list", postUuid] as const,
};
