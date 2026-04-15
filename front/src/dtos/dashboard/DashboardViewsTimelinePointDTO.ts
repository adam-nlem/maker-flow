export interface DashboardViewsTimelinePointDTOJSON {
    date: string;
    value: number;
}

export class DashboardViewsTimelinePointDTO {
    constructor(
        public readonly date: string,
        public readonly value: number,
    ) {}

    static fromJSON(json: DashboardViewsTimelinePointDTOJSON): DashboardViewsTimelinePointDTO {
        return new DashboardViewsTimelinePointDTO(json.date, json.value);
    }
}
