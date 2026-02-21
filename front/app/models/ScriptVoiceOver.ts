import { VoiceOverType } from "./enums/VoiceOverType";

export interface ScriptVoiceOverJSON {
    uuid: string;
    content: string;
    voiceOverType: VoiceOverType;
    position: number;
    type: 'voice_over';
    createdAt: string;
    updatedAt?: string;
}

export class ScriptVoiceOver {
    public readonly type = 'voice_over' as const;

    constructor(
        public readonly uuid: string,
        public content: string,
        public voiceOverType: VoiceOverType,
        public position: number,
        public readonly createdAt: Date,
        public readonly updatedAt?: Date,
    ) { }

    static fromJSON(json: ScriptVoiceOverJSON): ScriptVoiceOver {
        return new ScriptVoiceOver(
            json.uuid,
            json.content,
            json.voiceOverType,
            json.position,
            new Date(json.createdAt),
            json.updatedAt ? new Date(json.updatedAt) : undefined,
        )
    }

    toJSON(): ScriptVoiceOverJSON {
        return {
            uuid: this.uuid,
            content: this.content,
            voiceOverType: this.voiceOverType,
            position: this.position,
            type: this.type,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt?.toISOString(),
        }
    }
}
