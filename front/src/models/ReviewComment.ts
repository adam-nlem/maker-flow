import { ReviewCommentStatus } from "./enums/ReviewCommentStatus";
import { User, type UserJSON } from "./User";

export interface ReviewCommentJSON {
    uuid: string;
    body: string;
    status: ReviewCommentStatus;
    videoTimecodeSeconds: number | null;
    createdAt: string;
    author: UserJSON | null;
    parentCommentUuid?: string | null;
    replies?: ReviewCommentJSON[];
}

export class ReviewComment {
    constructor(
        public readonly uuid: string,
        public body: string,
        public status: ReviewCommentStatus,
        public videoTimecodeSeconds: number | null,
        public createdAt: string,
        public author: User | null,
        public parentCommentUuid: string | null,
        public replies: ReviewComment[],
    ) { }

    static fromJSON(json: ReviewCommentJSON): ReviewComment {
        return new ReviewComment(
            json.uuid,
            json.body,
            json.status,
            json.videoTimecodeSeconds ?? null,
            json.createdAt,
            json.author ? User.fromJSON(json.author) : null,
            json.parentCommentUuid ?? null,
            (json.replies ?? []).map(ReviewComment.fromJSON),
        );
    }

    toJSON(): ReviewCommentJSON {
        return {
            uuid: this.uuid,
            body: this.body,
            status: this.status,
            videoTimecodeSeconds: this.videoTimecodeSeconds,
            createdAt: this.createdAt,
            author: this.author?.toJSON() ?? null,
            parentCommentUuid: this.parentCommentUuid,
            replies: this.replies.map(r => r.toJSON()),
        };
    }

    get isTopLevel(): boolean {
        return this.parentCommentUuid === null;
    }

    get isResolved(): boolean {
        return this.status === ReviewCommentStatus.Resolved;
    }
}
