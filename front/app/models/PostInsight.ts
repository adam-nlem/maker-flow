import type { PostInsightType } from "./enums/PostInsightType";


export interface PostInsightJSON {
    uuid: string,
    type: PostInsightType,
    value: number,
    createdAt: string;
    updatedAt?: string;
}

export class PostInsight {
    constructor(
        public readonly uuid: string,
        public readonly type: PostInsightType,
        public readonly value: number,
        public readonly createdAt: Date,
        public readonly updatedAt?: Date,
    ) { }

    static fromJSON(json: PostInsightJSON): PostInsight {
        return new PostInsight(
            json.uuid,
            json.type,
            json.value,
            new Date(json.createdAt),
            json.updatedAt ? new Date(json.updatedAt) : undefined,
        )
    }

    toJSON(): PostInsightJSON {
        return {
            uuid: this.uuid,
            type: this.type,
            value: this.value,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt?.toISOString(),
        }
    }
}
