import type { SocialAnalyticsMediaType } from "../../models/enums/SocialAnalyticsMediaType";
import type { SocialAnalyticsPostInsightType } from "../../models/enums/SocialAnalyticsPostInsightType";
import { SocialAnalyticsPostInsightWithEvolutionDTO, type SocialAnalyticsPostInsightWithEvolutionDTOJSON } from "./SocialAnalyticsPostInsightWithEvolutionDTO";

export interface SocialAnalyticsPostWithInsightsDTOJSON {
    uuid: string;
    externalId: string;
    mediaType: SocialAnalyticsMediaType;
    publishedAt: string;
    caption: string | null;
    insights: SocialAnalyticsPostInsightWithEvolutionDTOJSON[];
}

export class SocialAnalyticsPostWithInsightsDTO {
    constructor(
        public readonly uuid: string,
        public readonly externalId: string,
        public readonly mediaType: SocialAnalyticsMediaType,
        public readonly publishedAt: Date,
        public readonly caption: string | null,
        public readonly insights: SocialAnalyticsPostInsightWithEvolutionDTO[],

    ) { }

    static fromJSON(json: SocialAnalyticsPostWithInsightsDTOJSON): SocialAnalyticsPostWithInsightsDTO {
        return new SocialAnalyticsPostWithInsightsDTO(
            json.uuid,
            json.externalId,
            json.mediaType,
            new Date(json.publishedAt),
            json.caption,
            json.insights.map((insight) => SocialAnalyticsPostInsightWithEvolutionDTO.fromJSON(insight)),
        );
    }
}