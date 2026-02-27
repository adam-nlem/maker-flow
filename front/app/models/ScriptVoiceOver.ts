import { ScriptPartType } from "./enums/ScriptPartType";
import { Tone } from "./enums/Tone";

export interface ScriptVoiceOverJSON {
    uuid: string;
    content: string;
    tone: Tone;
    position: number;
    type: ScriptPartType.VoiceOver;
    createdAt: string;
    updatedAt?: string;
}

export class ScriptVoiceOver {
    public readonly type = ScriptPartType.VoiceOver;

    constructor(
        public readonly uuid: string,
        public content: string,
        public tone: Tone,
        public position: number,
        public readonly createdAt: Date,
        public readonly updatedAt?: Date,
    ) { }

    static fromJSON(json: ScriptVoiceOverJSON): ScriptVoiceOver {
        return new ScriptVoiceOver(
            json.uuid,
            json.content,
            json.tone,
            json.position,
            new Date(json.createdAt),
            json.updatedAt ? new Date(json.updatedAt) : undefined,
        )
    }

    toJSON(): ScriptVoiceOverJSON {
        return {
            uuid: this.uuid,
            content: this.content,
            tone: this.tone,
            position: this.position,
            type: this.type,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt?.toISOString(),
        }
    }
}
