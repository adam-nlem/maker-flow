import { Review, type ReviewJSON } from "~/models/Review";
import { ReviewVersion, type ReviewVersionJSON } from "~/models/ReviewVersion";
import type { ReviewStatus } from "~/models/enums/ReviewStatus";

export interface ReviewWithLatestVersionDTOJSON {
    review: ReviewJSON & { versions?: ReviewVersionJSON[] };
    latestVersion: ReviewVersionJSON | null;
    unresolvedCommentsCount?: number | null;
}

export class ReviewWithLatestVersionDTO {
    constructor(
        public readonly review: Review,
        public readonly latestVersion: ReviewVersion | null,
        public readonly versions: ReviewVersion[],
        public readonly unresolvedCommentsCount: number,
    ) { }

    static fromJSON(json: ReviewWithLatestVersionDTOJSON): ReviewWithLatestVersionDTO {
        const latestVersion = json.latestVersion ? ReviewVersion.fromJSON(json.latestVersion) : null;
        const versionsArray = Array.isArray(json.review.versions) && json.review.versions.length > 0
            ? json.review.versions.map(ReviewVersion.fromJSON)
            : latestVersion
                ? [latestVersion]
                : [];

        return new ReviewWithLatestVersionDTO(
            Review.fromJSON(json.review),
            latestVersion,
            versionsArray,
            json.unresolvedCommentsCount ?? 0,
        );
    }

    get currentStatus(): ReviewStatus | null {
        return this.latestVersion?.status ?? null;
    }

    /** Versions ordered newest-first for switcher / history surfaces. */
    get versionsNewestFirst(): ReviewVersion[] {
        return [...this.versions].sort((a, b) => {
            const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
            const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
            return bTime - aTime;
        });
    }
}
