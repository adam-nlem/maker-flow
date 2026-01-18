import type { SocialAnalyticsInsightType } from "./enums/SocialAnalyticsInsightType";

export interface SocialAnalyticsInsightJSON {
    uuid: string,
    type: SocialAnalyticsInsightType,
    value: number,
    createdAt: string;
    updatedAt?: string;
}

export class SocialAnalyticsInsight {
    constructor(
        public readonly uuid: string,
        public readonly type: SocialAnalyticsInsightType,
        public readonly value: number,
        public readonly createdAt: Date,
        public readonly updatedAt?: Date,
    ) { }

    static fromJSON(json: SocialAnalyticsInsightJSON): SocialAnalyticsInsight {
        return new SocialAnalyticsInsight(
            json.uuid,
            json.type,
            json.value,
            new Date(json.createdAt),
            json.updatedAt ? new Date(json.updatedAt) : undefined,
        )
    }

    toJSON(): SocialAnalyticsInsightJSON {
        return {
            uuid: this.uuid,
            type: this.type,
            value: this.value,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt?.toISOString(),
        }
    }
}