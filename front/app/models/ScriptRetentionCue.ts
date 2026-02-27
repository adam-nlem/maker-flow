import { RetentionCueType } from "./enums/RetentionCueType";
import { ScriptPartType } from "./enums/ScriptPartType";

export interface ScriptRetentionCueJSON {
    uuid: string;
    content: string;
    retentionCueType: RetentionCueType;
    position: number;
    type: ScriptPartType.RetentionCue;
    createdAt: string;
    updatedAt?: string;
}

export class ScriptRetentionCue {
    public readonly type = ScriptPartType.RetentionCue;

    constructor(
        public readonly uuid: string,
        public content: string,
        public retentionCueType: RetentionCueType,
        public position: number,
        public readonly createdAt: Date,
        public readonly updatedAt?: Date,
    ) { }

    static fromJSON(json: ScriptRetentionCueJSON): ScriptRetentionCue {
        return new ScriptRetentionCue(
            json.uuid,
            json.content,
            json.retentionCueType,
            json.position,
            new Date(json.createdAt),
            json.updatedAt ? new Date(json.updatedAt) : undefined,
        )
    }

    toJSON(): ScriptRetentionCueJSON {
        return {
            uuid: this.uuid,
            content: this.content,
            retentionCueType: this.retentionCueType,
            position: this.position,
            type: this.type,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt?.toISOString(),
        }
    }
}
