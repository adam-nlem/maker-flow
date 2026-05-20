import { MediaType } from "./enums/MediaType";
import { PostDraftStatus } from "./enums/PostDraftStatus";
import { PostDraftMediaVersion, type PostDraftMediaVersionJSON } from "./PostDraftMediaVersion";
import { Script, type ScriptJSON } from "./Script";

export interface PostDraftJSON {
    uuid: string;
    title: string;
    description?: string | null;
    notes?: string | null;
    mediaType: MediaType;
    createdAt: string;
    updatedAt: string;
    script: ScriptJSON | null;
    mediaVersions?: PostDraftMediaVersionJSON[];
    latestMediaVersion?: PostDraftMediaVersionJSON | null;
}

export class PostDraft {
    constructor(
        public readonly uuid: string,
        public title: string,
        public description: string | null,
        public notes: string | null,
        public mediaType: MediaType,
        public createdAt: string,
        public updatedAt: string,
        public script: Script | null,
        public mediaVersions: PostDraftMediaVersion[],
    ) { }

    static fromJSON(json: PostDraftJSON): PostDraft {
        const mediaVersionsJson = json.mediaVersions ?? (json.latestMediaVersion ? [json.latestMediaVersion] : []);

        return new PostDraft(
            json.uuid,
            json.title,
            json.description ?? null,
            json.notes ?? null,
            json.mediaType,
            json.createdAt,
            json.updatedAt,
            json.script ? Script.fromJSON(json.script) : null,
            mediaVersionsJson.map(PostDraftMediaVersion.fromJSON),
        );
    }

    toJSON(): PostDraftJSON {
        return {
            uuid: this.uuid,
            title: this.title,
            description: this.description,
            notes: this.notes,
            mediaType: this.mediaType,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            script: this.script ? this.script.toJSON() : null,
            mediaVersions: this.mediaVersions.map(v => v.toJSON()),
        };
    }

    get latestMediaVersion(): PostDraftMediaVersion | null {
        if (this.mediaVersions.length === 0) return null;
        const sorted = [...this.mediaVersions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        return sorted[0];
    }

    get currentStatus(): PostDraftStatus | null {
        return this.latestMediaVersion?.status ?? null;
    }
}
