import type { SocialAnalyticsPostWithInsightsDTO } from "../dtos/socialAnalyticsPosts/SocialAnalyticsPostWithInsightsDTO";

export function filterPostsByDays(
    posts: SocialAnalyticsPostWithInsightsDTO[],
    days: number,
): SocialAnalyticsPostWithInsightsDTO[] {
    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - days);

    return posts.filter((post) => post.post.publishedAt >= cutoff);
}
