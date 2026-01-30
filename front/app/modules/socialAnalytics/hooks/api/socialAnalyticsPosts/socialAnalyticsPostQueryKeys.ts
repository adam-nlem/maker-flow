export const socialAnalyticsPostQueryKeys = {
    all: ["socialAnalyticsPosts"] as const,
    list: (integrationUuid: string) => [...socialAnalyticsPostQueryKeys.all, "list", integrationUuid] as const,
    thumbnail: (postUuid: string) => [...socialAnalyticsPostQueryKeys.all, "thumbnail", postUuid] as const,
};
