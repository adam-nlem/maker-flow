import { Post, type PostJSON } from "~/models/Post";
import { Script, type ScriptJSON } from "./Script";

export interface PostGroupJSON {
    uuid: string;
    title: string;
    createdAt: string;
    updatedAt: string | null;
    posts?: PostJSON[];
    script?: ScriptJSON | null;
}

export class PostGroup {
    constructor(
        public readonly uuid: string,
        public readonly title: string,
        public readonly createdAt: Date,
        public readonly updatedAt: Date | null,
        public readonly posts: Post[] = [],
        public readonly script: Script | null = null,
    ) { }

    static fromJSON(json: PostGroupJSON): PostGroup {
        return new PostGroup(
            json.uuid,
            json.title,
            new Date(json.createdAt),
            json.updatedAt ? new Date(json.updatedAt) : null,
            json.posts?.map(Post.fromJSON) ?? [],
            json.script ? Script.fromJSON(json.script) : null,
        );
    }
}
