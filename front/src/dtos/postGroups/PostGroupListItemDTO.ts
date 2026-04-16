export interface PostGroupListItemDTOJSON {
    uuid: string;
    title: string;
    createdAt: string;
    postUuids: string[];
    views: number | null;
    likes: number | null;
    comments: number | null;
    scriptTitle: string | null;
}

export class PostGroupListItemDTO {
    constructor(
        public readonly uuid: string,
        public readonly title: string,
        public readonly createdAt: Date,
        public readonly postUuids: string[],
        public readonly views: number | null,
        public readonly likes: number | null,
        public readonly comments: number | null,
        public readonly scriptTitle: string | null,
    ) {}

    static fromJSON(json: PostGroupListItemDTOJSON): PostGroupListItemDTO {
        return new PostGroupListItemDTO(
            json.uuid,
            json.title,
            new Date(json.createdAt),
            json.postUuids,
            json.views,
            json.likes,
            json.comments,
            json.scriptTitle,
        );
    }
}
