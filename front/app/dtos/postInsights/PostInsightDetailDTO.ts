import { Post, type PostJSON } from "~/models/Post";
import { PostInsightWithEvolutionDTO, type PostInsightWithEvolutionDTOJSON } from "~/dtos/posts/PostInsightWithEvolutionDTO";
import { PostInsightTimelineDTO, type PostInsightTimelineDTOJSON } from "./PostInsightTimelineDTO";
import { PostRankingItemDTO, type PostRankingItemDTOJSON } from "./PostRankingItemDTO";

export interface PostInsightDetailDTOJSON {
    post: PostJSON;
    insightsWithEvolution: PostInsightWithEvolutionDTOJSON[];
    engagementByFollowers: number | null;
    engagementByReach: number | null;
    timelines: PostInsightTimelineDTOJSON[];
    ranking: PostRankingItemDTOJSON[];
}

export class PostInsightDetailDTO {
    constructor(
        public readonly post: Post,
        public readonly insightsWithEvolution: PostInsightWithEvolutionDTO[],
        public readonly engagementByFollowers: number | null,
        public readonly engagementByReach: number | null,
        public readonly timelines: PostInsightTimelineDTO[],
        public readonly ranking: PostRankingItemDTO[],
    ) {}

    static fromJSON(json: PostInsightDetailDTOJSON): PostInsightDetailDTO {
        return new PostInsightDetailDTO(
            Post.fromJSON(json.post),
            json.insightsWithEvolution.map((insight) => PostInsightWithEvolutionDTO.fromJSON(insight)),
            json.engagementByFollowers,
            json.engagementByReach,
            json.timelines.map((timeline) => PostInsightTimelineDTO.fromJSON(timeline)),
            json.ranking.map((item) => PostRankingItemDTO.fromJSON(item)),
        );
    }
}
