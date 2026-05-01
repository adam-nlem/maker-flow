import { ScriptPartType } from "./enums/ScriptPartType";

export interface ScriptPartJSON {
    uuid: string;
    content: string;
    position: number;
    type: ScriptPartType;
    createdAt: string;
    updatedAt?: string;
}

export class ScriptPart {
    constructor(
        public readonly uuid: string,
        public content: string,
        public position: number,
        public type: ScriptPartType,
        public readonly createdAt: Date,
        public readonly updatedAt?: Date,
    ) {}

    static fromJSON(json: ScriptPartJSON): ScriptPart {
        return new ScriptPart(
            json.uuid,
            json.content,
            json.position,
            json.type,
            new Date(json.createdAt),
            json.updatedAt ? new Date(json.updatedAt) : undefined,
        );
    }

    toJSON(): ScriptPartJSON {
        return {
            uuid: this.uuid,
            content: this.content,
            position: this.position,
            type: this.type,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt?.toISOString(),
        };
    }
}

export function scriptPartFromJSON(json: ScriptPartJSON): ScriptPart {
    return ScriptPart.fromJSON(json);
}
