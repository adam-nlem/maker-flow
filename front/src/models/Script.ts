import { ScriptTag, type ScriptTagJSON } from "./ScriptTag";
import { ContentType } from "./enums/ContentType";
import { Platform, platformOptions } from "./enums/Platform";
import { ScriptStatus } from "./enums/ScriptStatus";

export interface ScriptJSON {
    uuid: string;
    title: string;
    publishedAt?: string;
    tags?: ScriptTagJSON[];
    platforms?: string[];
    contentType?: string;
    status?: string;
    createdAt: string;
    updatedAt?: string;
}

export class Script {
    constructor(
        public readonly uuid: string,
        public title: string,
        public publishedAt: Date | undefined,
        public tags: ScriptTag[],
        public platforms: Platform[],
        public contentType: ContentType | undefined,
        public status: ScriptStatus | undefined,
        public readonly createdAt: Date,
        public readonly updatedAt?: Date,
    ) { }

    static fromJSON(json: ScriptJSON): Script {
        return new Script(
            json.uuid,
            json.title,
            json.publishedAt ? new Date(json.publishedAt) : undefined,
            (json.tags ?? []).map(ScriptTag.fromJSON),
            (json.platforms ?? []).filter(p => platformOptions.includes(p as Platform)) as Platform[],
            json.contentType ? json.contentType as ContentType : undefined,
            json.status ? json.status as ScriptStatus : undefined,
            new Date(json.createdAt),
            json.updatedAt ? new Date(json.updatedAt) : undefined,
        )
    }

    toJSON(): ScriptJSON {
        return {
            uuid: this.uuid,
            title: this.title,
            publishedAt: this.publishedAt?.toISOString(),
            tags: this.tags.map(t => t.toJSON()),
            platforms: this.platforms,
            contentType: this.contentType,
            status: this.status,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt?.toISOString(),
        }
    }
}
