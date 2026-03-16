import { Post, type PostJSON } from "~/models/Post";
import type { PostInsightType } from "~/models/enums/PostInsightType";

export interface PostWithAggregatedInsightsDTOJSON {
    post: PostJSON;
    aggregatedInsights: { type: PostInsightType; value: number }[];
}

export class PostWithAggregatedInsightsDTO {
    constructor(
        public readonly post: Post,
        public readonly aggregatedInsights: { type: PostInsightType; value: number }[],
    ) { }

    static fromJSON(json: PostWithAggregatedInsightsDTOJSON): PostWithAggregatedInsightsDTO {
        return new PostWithAggregatedInsightsDTO(
            Post.fromJSON(json.post),
            json.aggregatedInsights,
        );
    }
}
