import { IntegrationInsightTimelineDTO, type IntegrationInsightTimelineDTOJSON } from "./IntegrationInsightTimelineDTO";
import { IntegrationInsightWithEvolutionDTO, type IntegrationInsightWithEvolutionDTOJSON } from "./IntegrationInsightWithEvolutionDTO";

export interface IntegrationDetailDTOJSON {
    totalFollowers: number;
    postCount: number;
    streak: number;
    insights: IntegrationInsightWithEvolutionDTOJSON[];
    timelines: IntegrationInsightTimelineDTOJSON[];
    isYoutubeReportPending: boolean | null;
}

export class IntegrationDetailDTO {
    constructor(
        public readonly totalFollowers: number,
        public readonly postCount: number,
        public readonly streak: number,
        public readonly insights: IntegrationInsightWithEvolutionDTO[],
        public readonly timelines: IntegrationInsightTimelineDTO[],
        public readonly isYoutubeReportPending: boolean | null,
    ) {}

    static fromJSON(json: IntegrationDetailDTOJSON): IntegrationDetailDTO {
        return new IntegrationDetailDTO(
            json.totalFollowers,
            json.postCount,
            json.streak,
            json.insights.map((insight) => IntegrationInsightWithEvolutionDTO.fromJSON(insight)),
            json.timelines.map((timeline) => IntegrationInsightTimelineDTO.fromJSON(timeline)),
            json.isYoutubeReportPending,
        );
    }
}
