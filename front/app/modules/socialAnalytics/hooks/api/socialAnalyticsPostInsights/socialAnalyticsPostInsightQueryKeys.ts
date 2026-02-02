export const socialAnalyticsPostInsightQueryKeys = {
    all: ["socialAnalyticsPostInsights"] as const,
    detail: (postUuid: string) => [...socialAnalyticsPostInsightQueryKeys.all, "detail", postUuid] as const,
};
