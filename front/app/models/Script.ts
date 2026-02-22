import { HookTemplate, type HookTemplateJSON } from "./HookTemplate";
import { ScriptTag, type ScriptTagJSON } from "./ScriptTag";

export interface ScriptJSON {
    uuid: string;
    title: string;
    hook?: string;
    hookTemplate?: HookTemplateJSON;
    publishedAt?: string;
    tags?: ScriptTagJSON[];
    createdAt: string;
    updatedAt?: string;
}

export class Script {
    constructor(
        public readonly uuid: string,
        public title: string,
        public hook: string | undefined,
        public hookTemplate: HookTemplate | undefined,
        public publishedAt: Date | undefined,
        public tags: ScriptTag[],
        public readonly createdAt: Date,
        public readonly updatedAt?: Date,
    ) { }

    static fromJSON(json: ScriptJSON): Script {
        return new Script(
            json.uuid,
            json.title,
            json.hook,
            json.hookTemplate ? HookTemplate.fromJSON(json.hookTemplate) : undefined,
            json.publishedAt ? new Date(json.publishedAt) : undefined,
            (json.tags ?? []).map(ScriptTag.fromJSON),
            new Date(json.createdAt),
            json.updatedAt ? new Date(json.updatedAt) : undefined,
        )
    }

    toJSON(): ScriptJSON {
        return {
            uuid: this.uuid,
            title: this.title,
            hook: this.hook,
            hookTemplate: this.hookTemplate?.toJSON(),
            publishedAt: this.publishedAt?.toISOString(),
            tags: this.tags.map(t => t.toJSON()),
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt?.toISOString(),
        }
    }
}
