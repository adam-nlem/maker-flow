import { MediaType } from "./enums/MediaType";
import { PostDraftRevisionOptimizationStatus } from "./enums/PostDraftRevisionOptimizationStatus";
import { PostDraftStatus } from "./enums/PostDraftStatus";
import { PostDraftRevision, type PostDraftRevisionJSON } from "./PostDraftRevision";
import { Script, type ScriptJSON } from "./Script";

export interface PostDraftJSON {
    uuid: string;
    title: string;
    description?: string | null;
    notes?: string | null;
    mediaType: MediaType;
    status: PostDraftStatus;
    createdAt: string;
    updatedAt: string;
    script: ScriptJSON | null;
    revisions?: PostDraftRevisionJSON[];
    latestRevision?: PostDraftRevisionJSON | null;
}

export class PostDraft {
    constructor(
        public readonly uuid: string,
        public title: string,
        public description: string | null,
        public notes: string | null,
        public mediaType: MediaType,
        public status: PostDraftStatus,
        public createdAt: string,
        public updatedAt: string,
        public script: Script | null,
        public revisions: PostDraftRevision[],
    ) { }

    static fromJSON(json: PostDraftJSON): PostDraft {
        const revisionsJson = json.revisions ?? (json.latestRevision ? [json.latestRevision] : []);

        return new PostDraft(
            json.uuid,
            json.title,
            json.description ?? null,
            json.notes ?? null,
            json.mediaType,
            json.status,
            json.createdAt,
            json.updatedAt,
            json.script ? Script.fromJSON(json.script) : null,
            revisionsJson.map(PostDraftRevision.fromJSON),
        );
    }

    toJSON(): PostDraftJSON {
        return {
            uuid: this.uuid,
            title: this.title,
            description: this.description,
            notes: this.notes,
            mediaType: this.mediaType,
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            script: this.script ? this.script.toJSON() : null,
            revisions: this.revisions.map(r => r.toJSON()),
        };
    }

    get latestRevision(): PostDraftRevision | null {
        if (this.revisions.length === 0) return null;
        const sorted = [...this.revisions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        return sorted[0];
    }

    get isOptimizing(): boolean {
        return this.revisions.some(r =>
            r.optimizationStatus === PostDraftRevisionOptimizationStatus.Pending
            || r.optimizationStatus === PostDraftRevisionOptimizationStatus.Optimizing
        );
    }
}
