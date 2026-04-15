import type { Platform } from "~/models/enums/Platform";

export interface DashboardPlatformDetailDTOJSON {
    platform: Platform;
    integrationUuid: string;
    followers: number;
    views: number;
    engagementRate: number | null;
    reach: number;
}

export class DashboardPlatformDetailDTO {
    constructor(
        public readonly platform: Platform,
        public readonly integrationUuid: string,
        public readonly followers: number,
        public readonly views: number,
        public readonly engagementRate: number | null,
        public readonly reach: number,
    ) {}

    static fromJSON(json: DashboardPlatformDetailDTOJSON): DashboardPlatformDetailDTO {
        return new DashboardPlatformDetailDTO(
            json.platform,
            json.integrationUuid,
            json.followers,
            json.views,
            json.engagementRate,
            json.reach,
        );
    }
}
