import { Integration, type IntegrationJSON } from "~/models/Integration";
import {
    IntegrationInsightWithEvolutionDTO,
    type IntegrationInsightWithEvolutionDTOJSON,
} from "./IntegrationInsightWithEvolutionDTO";

export interface IntegrationInsightsGroupedByIntegrationDTOJSON {
    integration: IntegrationJSON;
    insights: IntegrationInsightWithEvolutionDTOJSON[];
}

export class IntegrationInsightsGroupedByIntegrationDTO {
    constructor(
        public readonly integration: Integration,
        public readonly insights: IntegrationInsightWithEvolutionDTO[],
    ) {}

    static fromJSON(json: IntegrationInsightsGroupedByIntegrationDTOJSON): IntegrationInsightsGroupedByIntegrationDTO {
        return new IntegrationInsightsGroupedByIntegrationDTO(
            Integration.fromJSON(json.integration),
            json.insights.map((insight) => IntegrationInsightWithEvolutionDTO.fromJSON(insight)),
        );
    }
}
