import { SocialAnalyticsPost, type SocialAnalyticsPostJSON } from "../../models/SocialAnalyticsPost";
import { SocialAnalyticsPostInsightWithEvolutionDTO, type SocialAnalyticsPostInsightWithEvolutionDTOJSON } from "../socialAnalyticsPosts/SocialAnalyticsPostInsightWithEvolutionDTO";
import { SocialAnalyticsPostInsightTimelineDTO, type SocialAnalyticsPostInsightTimelineDTOJSON } from "./SocialAnalyticsPostInsightTimelineDTO";

export interface SocialAnalyticsPostInsightDetailDTOJSON {
    post: SocialAnalyticsPostJSON;
    insightsWithEvolution: SocialAnalyticsPostInsightWithEvolutionDTOJSON[];
    engagementByFollowers: number | null;
    engagementByReach: number | null;
    timelines: SocialAnalyticsPostInsightTimelineDTOJSON[];
}

export class SocialAnalyticsPostInsightDetailDTO {
    constructor(
        public readonly post: SocialAnalyticsPost,
        public readonly insightsWithEvolution: SocialAnalyticsPostInsightWithEvolutionDTO[],
        public readonly engagementByFollowers: number | null,
        public readonly engagementByReach: number | null,
        public readonly timelines: SocialAnalyticsPostInsightTimelineDTO[],
    ) {}

    static fromJSON(json: SocialAnalyticsPostInsightDetailDTOJSON): SocialAnalyticsPostInsightDetailDTO {
        return new SocialAnalyticsPostInsightDetailDTO(
            SocialAnalyticsPost.fromJSON(json.post),
            json.insightsWithEvolution.map((insight) => SocialAnalyticsPostInsightWithEvolutionDTO.fromJSON(insight)),
            json.engagementByFollowers,
            json.engagementByReach,
            json.timelines.map((timeline) => SocialAnalyticsPostInsightTimelineDTO.fromJSON(timeline)),
        );
    }
}
