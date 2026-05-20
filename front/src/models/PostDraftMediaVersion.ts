import { PostDraftStatus } from "./enums/PostDraftStatus";
import { PostDraftMediaVersionComment, type PostDraftMediaVersionCommentJSON } from "./PostDraftMediaVersionComment";

export interface PostDraftMediaVersionJSON {
    uuid: string;
    fileCount: number;
    status: PostDraftStatus;
    createdAt: string;
    comments?: PostDraftMediaVersionCommentJSON[];
}

export class PostDraftMediaVersion {
    constructor(
        public readonly uuid: string,
        public fileCount: number,
        public status: PostDraftStatus,
        public createdAt: string,
        public comments: PostDraftMediaVersionComment[],
    ) { }

    static fromJSON(json: PostDraftMediaVersionJSON): PostDraftMediaVersion {
        return new PostDraftMediaVersion(
            json.uuid,
            json.fileCount,
            json.status,
            json.createdAt,
            (json.comments ?? []).map(PostDraftMediaVersionComment.fromJSON),
        );
    }

    toJSON(): PostDraftMediaVersionJSON {
        return {
            uuid: this.uuid,
            fileCount: this.fileCount,
            status: this.status,
            createdAt: this.createdAt,
            comments: this.comments.map(c => c.toJSON()),
        };
    }
}
