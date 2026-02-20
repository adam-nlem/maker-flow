import { Post, type PostJSON } from "~/models/Post";
import { PostInsightWithEvolutionDTO, type PostInsightWithEvolutionDTOJSON } from "./PostInsightWithEvolutionDTO";

export interface PostWithInsightsDTOJSON {
    post: PostJSON;
    insights: PostInsightWithEvolutionDTOJSON[];
    engagementByFollowers: number | null;
    engagementByReach: number | null;
}

export class PostWithInsightsDTO {
    constructor(
        public readonly post: Post,
        public readonly insights: PostInsightWithEvolutionDTO[],
        public readonly engagementByFollowers: number | null,
        public readonly engagementByReach: number | null,
    ) { }

    static fromJSON(json: PostWithInsightsDTOJSON): PostWithInsightsDTO {
        return new PostWithInsightsDTO(
            Post.fromJSON(json.post),
            json.insights.map((insight) => PostInsightWithEvolutionDTO.fromJSON(insight)),
            json.engagementByFollowers,
            json.engagementByReach,
        );
    }
}
