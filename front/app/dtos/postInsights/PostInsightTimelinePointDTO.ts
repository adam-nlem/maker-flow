export interface PostInsightTimelinePointDTOJSON {
    hoursAfterPublication: number;
    value: number;
    averageValue: number | null;
}

export class PostInsightTimelinePointDTO {
    constructor(
        public readonly hoursAfterPublication: number,
        public readonly value: number,
        public readonly averageValue: number | null,
    ) {}

    static fromJSON(json: PostInsightTimelinePointDTOJSON): PostInsightTimelinePointDTO {
        return new PostInsightTimelinePointDTO(
            json.hoursAfterPublication,
            json.value,
            json.averageValue,
        );
    }
}
