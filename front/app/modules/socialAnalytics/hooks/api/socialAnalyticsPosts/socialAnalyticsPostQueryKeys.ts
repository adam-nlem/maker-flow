import type { SocialAnalyticsTimePeriod } from "~/modules/socialAnalytics/models/enums/SocialAnalyticsTimePeriod";

export const socialAnalyticsPostQueryKeys = {
    all: ["socialAnalyticsPosts"] as const,
    list: (integrationUuid: string, timePeriod: SocialAnalyticsTimePeriod) => [...socialAnalyticsPostQueryKeys.all, "list", integrationUuid, timePeriod] as const,
    thumbnail: (postUuid: string) => [...socialAnalyticsPostQueryKeys.all, "thumbnail", postUuid] as const,
};