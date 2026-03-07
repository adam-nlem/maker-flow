import { Integration, type IntegrationJSON } from "~/models/Integration";
import { IntegrationInsight, type IntegrationInsightJSON } from "~/models/IntegrationInsight";

export interface IntegrationInsightsGroupedByIntegrationDTOJSON {
    integration: IntegrationJSON;
    insights: IntegrationInsightJSON[];
}

export class IntegrationInsightsGroupedByIntegrationDTO {
    constructor(
        public readonly integration: Integration,
        public readonly insights: IntegrationInsight[],
    ) {}

    static fromJSON(json: IntegrationInsightsGroupedByIntegrationDTOJSON): IntegrationInsightsGroupedByIntegrationDTO {
        return new IntegrationInsightsGroupedByIntegrationDTO(
            Integration.fromJSON(json.integration),
            json.insights.map((insight) => IntegrationInsight.fromJSON(insight)),
        );
    }
}
