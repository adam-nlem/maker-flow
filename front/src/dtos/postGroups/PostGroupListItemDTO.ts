export interface PostGroupListItemDTOJSON {
    uuid: string;
    title: string;
    createdAt: string;
    postCount: number;
    views: number | null;
    totalInteractions: number | null;
    engagementByViews: number | null;
    scriptTitle: string | null;
}

export class PostGroupListItemDTO {
    constructor(
        public readonly uuid: string,
        public readonly title: string,
        public readonly createdAt: Date,
        public readonly postCount: number,
        public readonly views: number | null,
        public readonly totalInteractions: number | null,
        public readonly engagementByViews: number | null,
        public readonly scriptTitle: string | null,
    ) {}

    static fromJSON(json: PostGroupListItemDTOJSON): PostGroupListItemDTO {
        return new PostGroupListItemDTO(
            json.uuid,
            json.title,
            new Date(json.createdAt),
            json.postCount,
            json.views,
            json.totalInteractions,
            json.engagementByViews,
            json.scriptTitle,
        );
    }
}
