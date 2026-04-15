import type { Platform } from "~/models/enums/Platform";
import {
    IntegrationInsightsViewsTimelinePointDTO,
    type IntegrationInsightsViewsTimelinePointDTOJSON,
} from "./IntegrationInsightsViewsTimelinePointDTO";

export interface IntegrationInsightsViewsTimelineDTOJSON {
    platform: Platform;
    points: IntegrationInsightsViewsTimelinePointDTOJSON[];
}

export class IntegrationInsightsViewsTimelineDTO {
    constructor(
        public readonly platform: Platform,
        public readonly points: IntegrationInsightsViewsTimelinePointDTO[],
    ) {}

    static fromJSON(json: IntegrationInsightsViewsTimelineDTOJSON): IntegrationInsightsViewsTimelineDTO {
        return new IntegrationInsightsViewsTimelineDTO(
            json.platform,
            json.points.map((p) => IntegrationInsightsViewsTimelinePointDTO.fromJSON(p)),
        );
    }
}
