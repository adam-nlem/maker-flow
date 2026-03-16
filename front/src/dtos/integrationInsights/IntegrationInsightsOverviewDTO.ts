import type { IntegrationInsightType } from "~/models/enums/IntegrationInsightType";
import {
    IntegrationInsightsGroupedByIntegrationDTO,
    type IntegrationInsightsGroupedByIntegrationDTOJSON,
} from "./IntegrationInsightsGroupedByIntegrationDTO";

export interface IntegrationInsightsOverviewDTOJSON {
    groups: IntegrationInsightsGroupedByIntegrationDTOJSON[];
    aggregatedInsights: { type: IntegrationInsightType; value: number }[];
}

export class IntegrationInsightsOverviewDTO {
    constructor(
        public readonly groups: IntegrationInsightsGroupedByIntegrationDTO[],
        public readonly aggregatedInsights: { type: IntegrationInsightType; value: number }[],
    ) {}

    static fromJSON(json: IntegrationInsightsOverviewDTOJSON): IntegrationInsightsOverviewDTO {
        return new IntegrationInsightsOverviewDTO(
            json.groups.map((g) => IntegrationInsightsGroupedByIntegrationDTO.fromJSON(g)),
            json.aggregatedInsights,
        );
    }
}
