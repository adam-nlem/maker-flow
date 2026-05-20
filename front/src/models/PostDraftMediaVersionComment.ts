import { User, type UserJSON } from "./User";

export interface PostDraftMediaVersionCommentJSON {
    uuid: string;
    body: string;
    createdAt: string;
    author: UserJSON | null;
}

export class PostDraftMediaVersionComment {
    constructor(
        public readonly uuid: string,
        public body: string,
        public createdAt: string,
        public author: User | null,
    ) { }

    static fromJSON(json: PostDraftMediaVersionCommentJSON): PostDraftMediaVersionComment {
        return new PostDraftMediaVersionComment(
            json.uuid,
            json.body,
            json.createdAt,
            json.author ? User.fromJSON(json.author) : null,
        );
    }

    toJSON(): PostDraftMediaVersionCommentJSON {
        return {
            uuid: this.uuid,
            body: this.body,
            createdAt: this.createdAt,
            author: this.author?.toJSON() ?? null,
        };
    }
}
