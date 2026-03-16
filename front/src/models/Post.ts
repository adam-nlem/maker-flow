import type { MediaType } from "./enums/MediaType";

export interface PostJSON {
    uuid: string;
    externalId: string;
    mediaType: MediaType;
    publishedAt: string;
    caption: string | null;
    externalUrl: string;
    duration: number;
}

export class Post {
    constructor(
        public readonly uuid: string,
        public readonly externalId: string,
        public readonly mediaType: MediaType,
        public readonly publishedAt: Date,
        public readonly caption: string | null,
        public readonly externalUrl: string,
        public readonly duration: number,
    ) { }

    static fromJSON(json: PostJSON): Post {
        return new Post(
            json.uuid,
            json.externalId,
            json.mediaType,
            new Date(json.publishedAt),
            json.caption,
            json.externalUrl,
            json.duration,
        );
    }
}
