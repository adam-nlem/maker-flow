import type { SocialAnalyticsPostInsightJSON } from "../../models/SocialAnalyticsPostInsight";
import { SocialAnalyticsPostInsight } from "../../models/SocialAnalyticsPostInsight";

export interface SocialAnalyticsPostInsightWithEvolutionDTOJSON {
    insight: SocialAnalyticsPostInsightJSON;
    evolutionPercentage: string | null;
}

export class SocialAnalyticsPostInsightWithEvolutionDTO {
    constructor(
        public readonly insight: SocialAnalyticsPostInsight,
        public readonly evolutionPercentage: string | null,
    ) { }

    static fromJSON(json: SocialAnalyticsPostInsightWithEvolutionDTOJSON): SocialAnalyticsPostInsightWithEvolutionDTO {
        return new SocialAnalyticsPostInsightWithEvolutionDTO(
            SocialAnalyticsPostInsight.fromJSON(json.insight),
            json.evolutionPercentage,
        );
    }
}
