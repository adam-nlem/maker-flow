import type { SocialAnalyticsIntegrationInsightType } from "../../models/enums/SocialAnalyticsIntegrationInsightType";
import { SocialAnalyticsIntegrationInsight, type SocialAnalyticsIntegrationInsightJSON } from "../../models/SocialAnalyticsIntegrationInsight";

export interface SocialAnalyticsIntegrationInsightDailyPointsDTOJSON {
    type: SocialAnalyticsIntegrationInsightType;
    insights: SocialAnalyticsIntegrationInsightJSON[];
}

export class SocialAnalyticsIntegrationInsightDailyPointsDTO {
    constructor(
        public readonly type: SocialAnalyticsIntegrationInsightType,
        public readonly insights: SocialAnalyticsIntegrationInsight[],
    ) { }

    static fromJSON(json: SocialAnalyticsIntegrationInsightDailyPointsDTOJSON): SocialAnalyticsIntegrationInsightDailyPointsDTO {
        return new SocialAnalyticsIntegrationInsightDailyPointsDTO(
            json.type,
            json.insights.map((insight) => SocialAnalyticsIntegrationInsight.fromJSON(insight)),
        );
    }
}
