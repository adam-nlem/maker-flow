import type { PostWithInsightsDTO } from "~/dtos/posts/PostWithInsightsDTO";

export function filterPostsByDays(
    posts: PostWithInsightsDTO[],
    days: number,
): PostWithInsightsDTO[] {
    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - days);

    return posts.filter((post) => post.post.publishedAt >= cutoff);
}
