export interface IntegrationInsightsViewsTimelinePointDTOJSON {
    date: string;
    value: number;
}

export class IntegrationInsightsViewsTimelinePointDTO {
    constructor(
        public readonly date: string,
        public readonly value: number,
    ) {}

    static fromJSON(json: IntegrationInsightsViewsTimelinePointDTOJSON): IntegrationInsightsViewsTimelinePointDTO {
        return new IntegrationInsightsViewsTimelinePointDTO(json.date, json.value);
    }
}
