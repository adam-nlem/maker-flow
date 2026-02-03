export interface SocialAnalyticsIntegrationInsightTimelinePointDTOJSON {
    createdAt: string;
    value: number;
}

export class SocialAnalyticsIntegrationInsightTimelinePointDTO {
    constructor(
        public readonly createdAt: Date,
        public readonly value: number,
    ) { }

    static fromJSON(json: SocialAnalyticsIntegrationInsightTimelinePointDTOJSON): SocialAnalyticsIntegrationInsightTimelinePointDTO {
        return new SocialAnalyticsIntegrationInsightTimelinePointDTO(
            new Date(json.createdAt),
            json.value,
        );
    }
}
