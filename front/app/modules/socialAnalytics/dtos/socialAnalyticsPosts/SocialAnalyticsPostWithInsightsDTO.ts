import { SocialAnalyticsPost, type SocialAnalyticsPostJSON } from "../../models/SocialAnalyticsPost";
import { SocialAnalyticsPostInsightWithEvolutionDTO, type SocialAnalyticsPostInsightWithEvolutionDTOJSON } from "./SocialAnalyticsPostInsightWithEvolutionDTO";

export interface SocialAnalyticsPostWithInsightsDTOJSON {
    post: SocialAnalyticsPostJSON;
    insights: SocialAnalyticsPostInsightWithEvolutionDTOJSON[];
    engagementByFollowers: number | null;
    engagementByReach: number | null;
}

export class SocialAnalyticsPostWithInsightsDTO {
    constructor(
        public readonly post: SocialAnalyticsPost,
        public readonly insights: SocialAnalyticsPostInsightWithEvolutionDTO[],
        public readonly engagementByFollowers: number | null,
        public readonly engagementByReach: number | null,
    ) { }

    static fromJSON(json: SocialAnalyticsPostWithInsightsDTOJSON): SocialAnalyticsPostWithInsightsDTO {
        return new SocialAnalyticsPostWithInsightsDTO(
            SocialAnalyticsPost.fromJSON(json.post),
            json.insights.map((insight) => SocialAnalyticsPostInsightWithEvolutionDTO.fromJSON(insight)),
            json.engagementByFollowers,
            json.engagementByReach,
        );
    }
}
