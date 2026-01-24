import { SocialAnalyticsIntegrationInsight, type SocialAnalyticsIntegrationInsightJSON } from "../SocialAnalyticsIntegrationInsight";

export interface SocialAnalyticsIntegrationDetailDTOJSON {
    totalFollowers: number;
    postCount: number;
    streak: number;
    insights: SocialAnalyticsIntegrationInsightJSON[];
}

export class SocialAnalyticsIntegrationDetailDTO {
    constructor(
        public readonly totalFollowers: number,
        public readonly postCount: number,
        public readonly streak: number,
        public readonly insights: SocialAnalyticsIntegrationInsight[],
    ) {}

    static fromJSON(json: SocialAnalyticsIntegrationDetailDTOJSON): SocialAnalyticsIntegrationDetailDTO {
        return new SocialAnalyticsIntegrationDetailDTO(
            json.totalFollowers,
            json.postCount,
            json.streak,
            json.insights.map((insight) => SocialAnalyticsIntegrationInsight.fromJSON(insight)),
        );
    }
}
