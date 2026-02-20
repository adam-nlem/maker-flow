import type { IntegrationInsightType } from "~/models/enums/IntegrationInsightType";
import { IntegrationInsightTimelinePointDTO, type IntegrationInsightTimelinePointDTOJSON } from "./IntegrationInsightTimelinePointDTO";

export interface IntegrationInsightTimelineDTOJSON {
    type: IntegrationInsightType;
    points: IntegrationInsightTimelinePointDTOJSON[];
}

export class IntegrationInsightTimelineDTO {
    constructor(
        public readonly type: IntegrationInsightType,
        public readonly points: IntegrationInsightTimelinePointDTO[],
    ) { }

    static fromJSON(json: IntegrationInsightTimelineDTOJSON): IntegrationInsightTimelineDTO {
        return new IntegrationInsightTimelineDTO(
            json.type,
            json.points.map((point) => IntegrationInsightTimelinePointDTO.fromJSON(point)),
        );
    }
}
