import { Color } from "./enums/Color";

export interface ScriptTagJSON {
    uuid: string;
    title: string;
    color: Color;
    createdAt: string;
    updatedAt?: string;
}

export class ScriptTag {
    constructor(
        public readonly uuid: string,
        public title: string,
        public color: Color,
        public readonly createdAt: Date,
        public readonly updatedAt?: Date,
    ) { }

    static fromJSON(json: ScriptTagJSON): ScriptTag {
        return new ScriptTag(
            json.uuid,
            json.title,
            json.color,
            new Date(json.createdAt),
            json.updatedAt ? new Date(json.updatedAt) : undefined,
        )
    }

    toJSON(): ScriptTagJSON {
        return {
            uuid: this.uuid,
            title: this.title,
            color: this.color,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt?.toISOString(),
        }
    }
}
