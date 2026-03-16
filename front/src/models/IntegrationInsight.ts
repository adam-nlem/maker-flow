import type { IntegrationInsightType } from "./enums/IntegrationInsightType";


export interface IntegrationInsightJSON {
    uuid: string,
    type: IntegrationInsightType,
    value: number,
    createdAt: string;
    updatedAt?: string;
}

export class IntegrationInsight {
    constructor(
        public readonly uuid: string,
        public readonly type: IntegrationInsightType,
        public readonly value: number,
        public readonly createdAt: Date,
        public readonly updatedAt?: Date,
    ) { }

    static fromJSON(json: IntegrationInsightJSON): IntegrationInsight {
        return new IntegrationInsight(
            json.uuid,
            json.type,
            json.value,
            new Date(json.createdAt),
            json.updatedAt ? new Date(json.updatedAt) : undefined,
        )
    }

    toJSON(): IntegrationInsightJSON {
        return {
            uuid: this.uuid,
            type: this.type,
            value: this.value,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt?.toISOString(),
        }
    }
}
