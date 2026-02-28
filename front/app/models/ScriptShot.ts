import { ScriptPartType } from "./enums/ScriptPartType";
import { ShotType } from "./enums/ShotType";

export interface ScriptShotJSON {
    uuid: string;
    content: string;
    shotType: ShotType;
    position: number;
    type: ScriptPartType.Shot;
    generationUuid?: string;
    createdAt: string;
    updatedAt?: string;
}

export class ScriptShot {
    public readonly type = ScriptPartType.Shot;

    constructor(
        public readonly uuid: string,
        public content: string,
        public shotType: ShotType,
        public position: number,
        public readonly createdAt: Date,
        public readonly updatedAt?: Date,
        public readonly generationUuid?: string,
    ) { }

    static fromJSON(json: ScriptShotJSON): ScriptShot {
        return new ScriptShot(
            json.uuid,
            json.content,
            json.shotType,
            json.position,
            new Date(json.createdAt),
            json.updatedAt ? new Date(json.updatedAt) : undefined,
            json.generationUuid,
        )
    }

    toJSON(): ScriptShotJSON {
        return {
            uuid: this.uuid,
            content: this.content,
            shotType: this.shotType,
            position: this.position,
            type: this.type,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt?.toISOString(),
        }
    }
}
