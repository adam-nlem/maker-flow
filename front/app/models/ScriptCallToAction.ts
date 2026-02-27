import { CallToActionType } from "./enums/CallToActionType";

export interface ScriptCallToActionJSON {
    uuid: string;
    content: string;
    callToActionType: CallToActionType;
    position: number;
    type: 'call_to_action';
    createdAt: string;
    updatedAt?: string;
}

export class ScriptCallToAction {
    public readonly type = 'call_to_action' as const;

    constructor(
        public readonly uuid: string,
        public content: string,
        public callToActionType: CallToActionType,
        public position: number,
        public readonly createdAt: Date,
        public readonly updatedAt?: Date,
    ) { }

    static fromJSON(json: ScriptCallToActionJSON): ScriptCallToAction {
        return new ScriptCallToAction(
            json.uuid,
            json.content,
            json.callToActionType,
            json.position,
            new Date(json.createdAt),
            json.updatedAt ? new Date(json.updatedAt) : undefined,
        )
    }

    toJSON(): ScriptCallToActionJSON {
        return {
            uuid: this.uuid,
            content: this.content,
            callToActionType: this.callToActionType,
            position: this.position,
            type: this.type,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt?.toISOString(),
        }
    }
}
