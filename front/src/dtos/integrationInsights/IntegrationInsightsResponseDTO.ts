import {
    IntegrationInsightsGroupedByIntegrationDTO,
    type IntegrationInsightsGroupedByIntegrationDTOJSON,
} from "./IntegrationInsightsGroupedByIntegrationDTO";
import {
    IntegrationInsightsOverviewDTO,
    type IntegrationInsightsOverviewDTOJSON,
} from "./IntegrationInsightsOverviewDTO";
import {
    IntegrationInsightsViewsTimelineDTO,
    type IntegrationInsightsViewsTimelineDTOJSON,
} from "./IntegrationInsightsViewsTimelineDTO";

export interface IntegrationInsightsResponseDTOJSON {
    groups: IntegrationInsightsGroupedByIntegrationDTOJSON[];
    overview: IntegrationInsightsOverviewDTOJSON;
    viewsTimeline: IntegrationInsightsViewsTimelineDTOJSON[];
}

export class IntegrationInsightsResponseDTO {
    constructor(
        public readonly groups: IntegrationInsightsGroupedByIntegrationDTO[],
        public readonly overview: IntegrationInsightsOverviewDTO,
        public readonly viewsTimeline: IntegrationInsightsViewsTimelineDTO[],
    ) { }

    static fromJSON(json: IntegrationInsightsResponseDTOJSON): IntegrationInsightsResponseDTO {
        return new IntegrationInsightsResponseDTO(
            json.groups.map((g) => IntegrationInsightsGroupedByIntegrationDTO.fromJSON(g)),
            IntegrationInsightsOverviewDTO.fromJSON(json.overview),
            json.viewsTimeline.map((v) => IntegrationInsightsViewsTimelineDTO.fromJSON(v)),
        );
    }
}
