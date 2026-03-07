import { PostGroup, type PostGroupJSON } from "~/models/PostGroup";
import type { PostInsightType } from "~/models/enums/PostInsightType";

export interface PostGroupWithAggregatedInsightsDTOJSON {
    postGroup: PostGroupJSON;
    aggregatedInsights: { type: PostInsightType; value: number }[];
}

export class PostGroupWithAggregatedInsightsDTO {
    constructor(
        public readonly postGroup: PostGroup,
        public readonly aggregatedInsights: { type: PostInsightType; value: number }[],
    ) { }

    static fromJSON(json: PostGroupWithAggregatedInsightsDTOJSON): PostGroupWithAggregatedInsightsDTO {
        return new PostGroupWithAggregatedInsightsDTO(
            PostGroup.fromJSON(json.postGroup),
            json.aggregatedInsights,
        );
    }
}
