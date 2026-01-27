import type { SocialAnalyticsPostInsightType } from "../../models/enums/SocialAnalyticsPostInsightType";

export interface SocialAnalyticsPostInsightWithEvolutionDTOJSON {
    type: SocialAnalyticsPostInsightType;
    value: number;
    evolutionPercentage: string | null;
}

export class SocialAnalyticsPostInsightWithEvolutionDTO {
    constructor(
        public readonly type: SocialAnalyticsPostInsightType,
        public readonly value: number,
        public readonly evolutionPercentage: string | null,
    ) { }

    static fromJSON(json: SocialAnalyticsPostInsightWithEvolutionDTOJSON): SocialAnalyticsPostInsightWithEvolutionDTO {
        return new SocialAnalyticsPostInsightWithEvolutionDTO(
            json.type,
            json.value,
            json.evolutionPercentage,
        );
    }
}