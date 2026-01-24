import { SocialAnalyticsIntegrationInsight, type SocialAnalyticsIntegrationInsightJSON } from "../SocialAnalyticsIntegrationInsight";

export interface SocialAnalyticsIntegrationOverviewDTOJSON {
    totalFollowers: number;
    postCount: number;
    streak: number;
    insights: SocialAnalyticsIntegrationInsightJSON[];
}

export class SocialAnalyticsIntegrationOverviewDTO {
    constructor(
        public readonly totalFollowers: number,
        public readonly postCount: number,
        public readonly streak: number,
        public readonly insights: SocialAnalyticsIntegrationInsight[],
    ) {}

    static fromJSON(json: SocialAnalyticsIntegrationOverviewDTOJSON): SocialAnalyticsIntegrationOverviewDTO {
        return new SocialAnalyticsIntegrationOverviewDTO(
            json.totalFollowers,
            json.postCount,
            json.streak,
            json.insights.map((insight) => SocialAnalyticsIntegrationInsight.fromJSON(insight)),
        );
    }
}
