import { Review, type ReviewJSON } from "~/models/Review";
import { ReviewVersion, type ReviewVersionJSON } from "~/models/ReviewVersion";
import type { ReviewStatus } from "~/models/enums/ReviewStatus";

export interface ReviewWithLatestVersionDTOJSON {
    review: ReviewJSON;
    latestVersion: ReviewVersionJSON | null;
}

export class ReviewWithLatestVersionDTO {
    constructor(
        public readonly review: Review,
        public readonly latestVersion: ReviewVersion | null,
    ) { }

    static fromJSON(json: ReviewWithLatestVersionDTOJSON): ReviewWithLatestVersionDTO {
        return new ReviewWithLatestVersionDTO(
            Review.fromJSON(json.review),
            json.latestVersion ? ReviewVersion.fromJSON(json.latestVersion) : null,
        );
    }

    get currentStatus(): ReviewStatus | null {
        return this.latestVersion?.status ?? null;
    }
}
