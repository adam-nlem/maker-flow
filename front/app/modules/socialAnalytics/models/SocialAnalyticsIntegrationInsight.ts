import type { SocialAnalyticsIntegrationInsightType } from "./enums/SocialAnalyticsIntegrationInsightType";


export interface SocialAnalyticsIntegrationInsightJSON {
    uuid: string,
    type: SocialAnalyticsIntegrationInsightType,
    value: number,
    createdAt: string;
    updatedAt?: string;
}

export class SocialAnalyticsIntegrationInsight {
    constructor(
        public readonly uuid: string,
        public readonly type: SocialAnalyticsIntegrationInsightType,
        public readonly value: number,
        public readonly createdAt: Date,
        public readonly updatedAt?: Date,
    ) { }

    static fromJSON(json: SocialAnalyticsIntegrationInsightJSON): SocialAnalyticsIntegrationInsight {
        return new SocialAnalyticsIntegrationInsight(
            json.uuid,
            json.type,
            json.value,
            new Date(json.createdAt),
            json.updatedAt ? new Date(json.updatedAt) : undefined,
        )
    }

    toJSON(): SocialAnalyticsIntegrationInsightJSON {
        return {
            uuid: this.uuid,
            type: this.type,
            value: this.value,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt?.toISOString(),
        }
    }
}
