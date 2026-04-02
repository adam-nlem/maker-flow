import { Post, type PostJSON } from "~/models/Post";
import type { Platform } from "~/models/enums/Platform";
import type { PostInsightType } from "~/models/enums/PostInsightType";

export interface PostWithPlatformAndInsightsDTOJSON {
    post: PostJSON;
    platform: Platform;
    aggregatedInsights: { type: PostInsightType; value: number }[];
    postGroupUuid: string | null;
    postGroupTitle: string | null;
    engagementByViews: number | null;
}

export class PostWithPlatformAndInsightsDTO {
    constructor(
        public readonly post: Post,
        public readonly platform: Platform,
        public readonly aggregatedInsights: { type: PostInsightType; value: number }[],
        public readonly postGroupUuid: string | null,
        public readonly postGroupTitle: string | null,
        public readonly engagementByViews: number | null,
    ) { }

    static fromJSON(json: PostWithPlatformAndInsightsDTOJSON): PostWithPlatformAndInsightsDTO {
        return new PostWithPlatformAndInsightsDTO(
            Post.fromJSON(json.post),
            json.platform,
            json.aggregatedInsights,
            json.postGroupUuid,
            json.postGroupTitle,
            json.engagementByViews,
        );
    }
}
