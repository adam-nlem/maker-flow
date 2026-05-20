import { ReviewStatus } from "./enums/ReviewStatus";
import { ReviewComment, type ReviewCommentJSON } from "./ReviewComment";

export interface ReviewVersionJSON {
    uuid: string;
    fileCount: number;
    status: ReviewStatus;
    createdAt: string;
    comments?: ReviewCommentJSON[];
}

export class ReviewVersion {
    constructor(
        public readonly uuid: string,
        public fileCount: number,
        public status: ReviewStatus,
        public createdAt: string,
        public comments: ReviewComment[],
    ) { }

    static fromJSON(json: ReviewVersionJSON): ReviewVersion {
        return new ReviewVersion(
            json.uuid,
            json.fileCount,
            json.status,
            json.createdAt,
            (json.comments ?? []).map(ReviewComment.fromJSON),
        );
    }

    toJSON(): ReviewVersionJSON {
        return {
            uuid: this.uuid,
            fileCount: this.fileCount,
            status: this.status,
            createdAt: this.createdAt,
            comments: this.comments.map(c => c.toJSON()),
        };
    }
}
