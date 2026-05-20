import { PostDraftCommentStatus } from "./enums/PostDraftCommentStatus";
import { User, type UserJSON } from "./User";

export interface PostDraftMediaVersionCommentJSON {
    uuid: string;
    body: string;
    status: PostDraftCommentStatus;
    videoTimecodeSeconds: number | null;
    createdAt: string;
    author: UserJSON | null;
    parentComment?: { uuid: string } | null;
    replies?: PostDraftMediaVersionCommentJSON[];
}

export class PostDraftMediaVersionComment {
    constructor(
        public readonly uuid: string,
        public body: string,
        public status: PostDraftCommentStatus,
        public videoTimecodeSeconds: number | null,
        public createdAt: string,
        public author: User | null,
        public parentCommentUuid: string | null,
        public replies: PostDraftMediaVersionComment[],
    ) { }

    static fromJSON(json: PostDraftMediaVersionCommentJSON): PostDraftMediaVersionComment {
        return new PostDraftMediaVersionComment(
            json.uuid,
            json.body,
            json.status,
            json.videoTimecodeSeconds ?? null,
            json.createdAt,
            json.author ? User.fromJSON(json.author) : null,
            json.parentComment?.uuid ?? null,
            (json.replies ?? []).map(PostDraftMediaVersionComment.fromJSON),
        );
    }

    toJSON(): PostDraftMediaVersionCommentJSON {
        return {
            uuid: this.uuid,
            body: this.body,
            status: this.status,
            videoTimecodeSeconds: this.videoTimecodeSeconds,
            createdAt: this.createdAt,
            author: this.author?.toJSON() ?? null,
            parentComment: this.parentCommentUuid ? { uuid: this.parentCommentUuid } : null,
            replies: this.replies.map(r => r.toJSON()),
        };
    }

    get isTopLevel(): boolean {
        return this.parentCommentUuid === null;
    }

    get isResolved(): boolean {
        return this.status === PostDraftCommentStatus.Resolved;
    }
}
