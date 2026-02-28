import { CallToActionType } from "./enums/CallToActionType";
import { ScriptPartType } from "./enums/ScriptPartType";

export interface ScriptCallToActionJSON {
    uuid: string;
    content: string;
    callToActionType: CallToActionType;
    position: number;
    type: ScriptPartType.CallToAction;
    generationUuid?: string;
    createdAt: string;
    updatedAt?: string;
}

export class ScriptCallToAction {
    public readonly type = ScriptPartType.CallToAction;

    constructor(
        public readonly uuid: string,
        public content: string,
        public callToActionType: CallToActionType,
        public position: number,
        public readonly createdAt: Date,
        public readonly updatedAt?: Date,
        public readonly generationUuid?: string,
    ) { }

    static fromJSON(json: ScriptCallToActionJSON): ScriptCallToAction {
        return new ScriptCallToAction(
            json.uuid,
            json.content,
            json.callToActionType,
            json.position,
            new Date(json.createdAt),
            json.updatedAt ? new Date(json.updatedAt) : undefined,
            json.generationUuid,
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
