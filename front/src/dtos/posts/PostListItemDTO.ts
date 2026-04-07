import type { Platform } from "~/models/enums/Platform";

export interface PostListItemDTOJSON {
    uuid: string;
    caption: string | null;
    publishedAt: string;
    platform: Platform;
    views: number | null;
    totalInteractions: number | null;
    engagementByViews: number | null;
}

export class PostListItemDTO {
    constructor(
        public readonly uuid: string,
        public readonly caption: string | null,
        public readonly publishedAt: Date,
        public readonly platform: Platform,
        public readonly views: number | null,
        public readonly totalInteractions: number | null,
        public readonly engagementByViews: number | null,
    ) {}

    static fromJSON(json: PostListItemDTOJSON): PostListItemDTO {
        return new PostListItemDTO(
            json.uuid,
            json.caption,
            new Date(json.publishedAt),
            json.platform,
            json.views,
            json.totalInteractions,
            json.engagementByViews,
        );
    }
}
