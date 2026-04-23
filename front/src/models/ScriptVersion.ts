import { ScriptVersionStatus } from "./enums/ScriptVersionStatus";

export interface ScriptVersionJSON {
    uuid: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export class ScriptVersion {
    constructor(
        public readonly uuid: string,
        public status: ScriptVersionStatus,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) {}

    static fromJSON(json: ScriptVersionJSON): ScriptVersion {
        return new ScriptVersion(
            json.uuid,
            json.status as ScriptVersionStatus,
            new Date(json.createdAt),
            new Date(json.updatedAt),
        );
    }

    get isDraft(): boolean {
        return this.status === ScriptVersionStatus.Draft;
    }
}
