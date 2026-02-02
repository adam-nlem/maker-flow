import type { SocialAnalyticsMediaType } from "./enums/SocialAnalyticsMediaType";

export interface SocialAnalyticsPostJSON {
    uuid: string;
    externalId: string;
    mediaType: SocialAnalyticsMediaType;
    publishedAt: string;
    caption: string | null;
    externalUrl: string;
    duration: number;
}

export class SocialAnalyticsPost {
    constructor(
        public readonly uuid: string,
        public readonly externalId: string,
        public readonly mediaType: SocialAnalyticsMediaType,
        public readonly publishedAt: Date,
        public readonly caption: string | null,
        public readonly externalUrl: string,
        public readonly duration: number,
    ) { }

    static fromJSON(json: SocialAnalyticsPostJSON): SocialAnalyticsPost {
        return new SocialAnalyticsPost(
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
