import { DashboardOverviewDTO, type DashboardOverviewDTOJSON } from "./DashboardOverviewDTO";
import { DashboardPlatformDetailDTO, type DashboardPlatformDetailDTOJSON } from "./DashboardPlatformDetailDTO";
import { DashboardViewsTimelineDTO, type DashboardViewsTimelineDTOJSON } from "./DashboardViewsTimelineDTO";

export interface DashboardDTOJSON {
    overview: DashboardOverviewDTOJSON;
    viewsTimeline: DashboardViewsTimelineDTOJSON[];
    platformDetails: DashboardPlatformDetailDTOJSON[];
}

export class DashboardDTO {
    constructor(
        public readonly overview: DashboardOverviewDTO,
        public readonly viewsTimeline: DashboardViewsTimelineDTO[],
        public readonly platformDetails: DashboardPlatformDetailDTO[],
    ) {}

    static fromJSON(json: DashboardDTOJSON): DashboardDTO {
        return new DashboardDTO(
            DashboardOverviewDTO.fromJSON(json.overview),
            json.viewsTimeline.map((v) => DashboardViewsTimelineDTO.fromJSON(v)),
            json.platformDetails.map((d) => DashboardPlatformDetailDTO.fromJSON(d)),
        );
    }
}
