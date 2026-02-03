import type { SocialAnalyticsIntegrationInsightType } from "../../models/enums/SocialAnalyticsIntegrationInsightType";
import { SocialAnalyticsIntegrationInsightTimelinePointDTO, type SocialAnalyticsIntegrationInsightTimelinePointDTOJSON } from "./SocialAnalyticsIntegrationInsightTimelinePointDTO";

export interface SocialAnalyticsIntegrationInsightTimelineDTOJSON {
    type: SocialAnalyticsIntegrationInsightType;
    points: SocialAnalyticsIntegrationInsightTimelinePointDTOJSON[];
}

export class SocialAnalyticsIntegrationInsightTimelineDTO {
    constructor(
        public readonly type: SocialAnalyticsIntegrationInsightType,
        public readonly points: SocialAnalyticsIntegrationInsightTimelinePointDTO[],
    ) { }

    static fromJSON(json: SocialAnalyticsIntegrationInsightTimelineDTOJSON): SocialAnalyticsIntegrationInsightTimelineDTO {
        return new SocialAnalyticsIntegrationInsightTimelineDTO(
            json.type,
            json.points.map((point) => SocialAnalyticsIntegrationInsightTimelinePointDTO.fromJSON(point)),
        );
    }
}
