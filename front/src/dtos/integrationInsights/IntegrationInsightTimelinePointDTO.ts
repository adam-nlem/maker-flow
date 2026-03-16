export interface IntegrationInsightTimelinePointDTOJSON {
    createdAt: string;
    value: number;
}

export class IntegrationInsightTimelinePointDTO {
    constructor(
        public readonly createdAt: Date,
        public readonly value: number,
    ) { }

    static fromJSON(json: IntegrationInsightTimelinePointDTOJSON): IntegrationInsightTimelinePointDTO {
        return new IntegrationInsightTimelinePointDTO(
            new Date(json.createdAt),
            json.value,
        );
    }
}
