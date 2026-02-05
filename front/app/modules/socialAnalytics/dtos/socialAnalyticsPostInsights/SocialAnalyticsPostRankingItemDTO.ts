import { SocialAnalyticsPost, type SocialAnalyticsPostJSON } from "../../models/SocialAnalyticsPost";

export interface SocialAnalyticsPostRankingItemDTOJSON {
    post: SocialAnalyticsPostJSON;
    score: number;
}

export class SocialAnalyticsPostRankingItemDTO {
    constructor(
        public readonly post: SocialAnalyticsPost,
        public readonly score: number,
    ) {}

    static fromJSON(json: SocialAnalyticsPostRankingItemDTOJSON): SocialAnalyticsPostRankingItemDTO {
        return new SocialAnalyticsPostRankingItemDTO(
            SocialAnalyticsPost.fromJSON(json.post),
            json.score,
        );
    }
}
