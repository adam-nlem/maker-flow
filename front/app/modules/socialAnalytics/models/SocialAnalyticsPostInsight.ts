import type { SocialAnalyticsPostInsightType } from "./enums/SocialAnalyticsPostInsightType";


export interface SocialAnalyticsPostInsightJSON {
    uuid: string,
    type: SocialAnalyticsPostInsightType,
    value: number,
    createdAt: string;
    updatedAt?: string;
}

export class SocialAnalyticsPostInsight {
    constructor(
        public readonly uuid: string,
        public readonly type: SocialAnalyticsPostInsightType,
        public readonly value: number,
        public readonly createdAt: Date,
        public readonly updatedAt?: Date,
    ) { }

    static fromJSON(json: SocialAnalyticsPostInsightJSON): SocialAnalyticsPostInsight {
        return new SocialAnalyticsPostInsight(
            json.uuid,
            json.type,
            json.value,
            new Date(json.createdAt),
            json.updatedAt ? new Date(json.updatedAt) : undefined,
        )
    }

    toJSON(): SocialAnalyticsPostInsightJSON {
        return {
            uuid: this.uuid,
            type: this.type,
            value: this.value,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt?.toISOString(),
        }
    }
}
