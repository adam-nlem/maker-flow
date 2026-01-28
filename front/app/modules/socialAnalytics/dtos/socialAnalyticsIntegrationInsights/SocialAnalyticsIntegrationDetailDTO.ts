import { SocialAnalyticsIntegrationInsightDailyPointsDTO, type SocialAnalyticsIntegrationInsightDailyPointsDTOJSON } from "./SocialAnalyticsIntegrationInsightDailyPointsDTO";
import { SocialAnalyticsIntegrationInsightWithEvolutionDTO, type SocialAnalyticsIntegrationInsightWithEvolutionDTOJSON } from "./SocialAnalyticsIntegrationInsightWithEvolutionDTO";

export interface SocialAnalyticsIntegrationDetailDTOJSON {
    totalFollowers: number;
    postCount: number;
    streak: number;
    insights: SocialAnalyticsIntegrationInsightWithEvolutionDTOJSON[];
    dailyPoints: SocialAnalyticsIntegrationInsightDailyPointsDTOJSON[];
}

export class SocialAnalyticsIntegrationDetailDTO {
    constructor(
        public readonly totalFollowers: number,
        public readonly postCount: number,
        public readonly streak: number,
        public readonly insights: SocialAnalyticsIntegrationInsightWithEvolutionDTO[],
        public readonly dailyPoints: SocialAnalyticsIntegrationInsightDailyPointsDTO[],
    ) {}

    static fromJSON(json: SocialAnalyticsIntegrationDetailDTOJSON): SocialAnalyticsIntegrationDetailDTO {
        return new SocialAnalyticsIntegrationDetailDTO(
            json.totalFollowers,
            json.postCount,
            json.streak,
            json.insights.map((insight) => SocialAnalyticsIntegrationInsightWithEvolutionDTO.fromJSON(insight)),
            json.dailyPoints.map((dailyPoints) => SocialAnalyticsIntegrationInsightDailyPointsDTO.fromJSON(dailyPoints)),
        );
    }
}
