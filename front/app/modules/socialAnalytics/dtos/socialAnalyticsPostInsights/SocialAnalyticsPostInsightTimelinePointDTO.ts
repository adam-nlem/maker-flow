export interface SocialAnalyticsPostInsightTimelinePointDTOJSON {
    hoursAfterPublication: number;
    value: number;
    averageValue: number | null;
}

export class SocialAnalyticsPostInsightTimelinePointDTO {
    constructor(
        public readonly hoursAfterPublication: number,
        public readonly value: number,
        public readonly averageValue: number | null,
    ) {}

    static fromJSON(json: SocialAnalyticsPostInsightTimelinePointDTOJSON): SocialAnalyticsPostInsightTimelinePointDTO {
        return new SocialAnalyticsPostInsightTimelinePointDTO(
            json.hoursAfterPublication,
            json.value,
            json.averageValue,
        );
    }
}
