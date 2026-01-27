import type { SocialAnalyticsIntegrationInsightType } from "../../models/enums/SocialAnalyticsIntegrationInsightType";


export interface SocialAnalyticsIntegrationInsightWithEvolutionDTOJSON {
    type: SocialAnalyticsIntegrationInsightType;
    value: number;
    evolutionPercentage: string | null;
}

export class SocialAnalyticsIntegrationInsightWithEvolutionDTO {
    constructor(
        public readonly type: SocialAnalyticsIntegrationInsightType,
        public readonly value: number,
        public readonly evolutionPercentage: string | null,
    ) { }

    static fromJSON(json: SocialAnalyticsIntegrationInsightWithEvolutionDTOJSON): SocialAnalyticsIntegrationInsightWithEvolutionDTO {
        return new SocialAnalyticsIntegrationInsightWithEvolutionDTO(
            json.type,
            json.value,
            json.evolutionPercentage,
        );
    }
}
