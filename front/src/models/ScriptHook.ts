import { ScriptPartType } from "./enums/ScriptPartType";
import { HookTemplate, type HookTemplateJSON } from "./HookTemplate";

export interface ScriptHookJSON {
    uuid: string;
    content: string;
    position: number;
    type: ScriptPartType.Hook;
    generationUuid?: string;
    hookTemplate?: HookTemplateJSON;
    createdAt: string;
    updatedAt?: string;
}

export class ScriptHook {
    public readonly type = ScriptPartType.Hook;

    constructor(
        public readonly uuid: string,
        public content: string,
        public position: number,
        public readonly createdAt: Date,
        public readonly updatedAt?: Date,
        public readonly generationUuid?: string,
        public readonly hookTemplate?: HookTemplate,
    ) { }

    static fromJSON(json: ScriptHookJSON): ScriptHook {
        return new ScriptHook(
            json.uuid,
            json.content,
            json.position,
            new Date(json.createdAt),
            json.updatedAt ? new Date(json.updatedAt) : undefined,
            json.generationUuid,
            json.hookTemplate ? HookTemplate.fromJSON(json.hookTemplate) : undefined,
        )
    }

    toJSON(): ScriptHookJSON {
        return {
            uuid: this.uuid,
            content: this.content,
            position: this.position,
            type: this.type,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt?.toISOString(),
        }
    }
}
