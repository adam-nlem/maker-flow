import type { SocialAnalyticsPostInsightType } from "../../models/enums/SocialAnalyticsPostInsightType";
import { SocialAnalyticsPostInsightTimelinePointDTO, type SocialAnalyticsPostInsightTimelinePointDTOJSON } from "./SocialAnalyticsPostInsightTimelinePointDTO";

export interface SocialAnalyticsPostInsightTimelineDTOJSON {
    type: SocialAnalyticsPostInsightType;
    points: SocialAnalyticsPostInsightTimelinePointDTOJSON[];
}

export class SocialAnalyticsPostInsightTimelineDTO {
    constructor(
        public readonly type: SocialAnalyticsPostInsightType,
        public readonly points: SocialAnalyticsPostInsightTimelinePointDTO[],
    ) {}

    static fromJSON(json: SocialAnalyticsPostInsightTimelineDTOJSON): SocialAnalyticsPostInsightTimelineDTO {
        return new SocialAnalyticsPostInsightTimelineDTO(
            json.type,
            json.points.map((point) => SocialAnalyticsPostInsightTimelinePointDTO.fromJSON(point)),
        );
    }
}
