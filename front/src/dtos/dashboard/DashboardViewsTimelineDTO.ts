import type { Platform } from "~/models/enums/Platform";
import { DashboardViewsTimelinePointDTO, type DashboardViewsTimelinePointDTOJSON } from "./DashboardViewsTimelinePointDTO";

export interface DashboardViewsTimelineDTOJSON {
    platform: Platform;
    points: DashboardViewsTimelinePointDTOJSON[];
}

export class DashboardViewsTimelineDTO {
    constructor(
        public readonly platform: Platform,
        public readonly points: DashboardViewsTimelinePointDTO[],
    ) {}

    static fromJSON(json: DashboardViewsTimelineDTOJSON): DashboardViewsTimelineDTO {
        return new DashboardViewsTimelineDTO(
            json.platform,
            json.points.map((p) => DashboardViewsTimelinePointDTO.fromJSON(p)),
        );
    }
}
