export interface DashboardOverviewDTOJSON {
    totalFollowers: number;
    totalFollowersEvolution: string | null;
    totalViews: number;
    totalViewsEvolution: string | null;
    engagementRate: number | null;
    engagementRateEvolution: string | null;
    totalReach: number;
    totalReachEvolution: string | null;
}

export class DashboardOverviewDTO {
    constructor(
        public readonly totalFollowers: number,
        public readonly totalFollowersEvolution: string | null,
        public readonly totalViews: number,
        public readonly totalViewsEvolution: string | null,
        public readonly engagementRate: number | null,
        public readonly engagementRateEvolution: string | null,
        public readonly totalReach: number,
        public readonly totalReachEvolution: string | null,
    ) {}

    static fromJSON(json: DashboardOverviewDTOJSON): DashboardOverviewDTO {
        return new DashboardOverviewDTO(
            json.totalFollowers,
            json.totalFollowersEvolution,
            json.totalViews,
            json.totalViewsEvolution,
            json.engagementRate,
            json.engagementRateEvolution,
            json.totalReach,
            json.totalReachEvolution,
        );
    }
}
