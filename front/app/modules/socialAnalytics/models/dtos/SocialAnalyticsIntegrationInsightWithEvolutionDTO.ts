import type { SocialAnalyticsIntegrationInsightType } from "../enums/SocialAnalyticsIntegrationInsightType";

export interface SocialAnalyticsIntegrationInsightWithEvolutionDTOJSON {
    type: SocialAnalyticsIntegrationInsightType;
    value: number;
    evolutionPercentage: number | null;
}

export class SocialAnalyticsIntegrationInsightWithEvolutionDTO {
    constructor(
        public readonly type: SocialAnalyticsIntegrationInsightType,
        public readonly value: number,
        public readonly evolutionPercentage: number | null,
    ) {}

    static fromJSON(json: SocialAnalyticsIntegrationInsightWithEvolutionDTOJSON): SocialAnalyticsIntegrationInsightWithEvolutionDTO {
        return new SocialAnalyticsIntegrationInsightWithEvolutionDTO(
            json.type,
            json.value,
            json.evolutionPercentage,
        );
    }
}
