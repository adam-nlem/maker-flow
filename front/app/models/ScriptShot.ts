import { ShotType } from "./enums/ShotType";

export interface ScriptShotJSON {
    uuid: string;
    content: string;
    shotType: ShotType;
    position: number;
    type: 'shot';
    createdAt: string;
    updatedAt?: string;
}

export class ScriptShot {
    public readonly type = 'shot' as const;

    constructor(
        public readonly uuid: string,
        public content: string,
        public shotType: ShotType,
        public position: number,
        public readonly createdAt: Date,
        public readonly updatedAt?: Date,
    ) { }

    static fromJSON(json: ScriptShotJSON): ScriptShot {
        return new ScriptShot(
            json.uuid,
            json.content,
            json.shotType,
            json.position,
            new Date(json.createdAt),
            json.updatedAt ? new Date(json.updatedAt) : undefined,
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
