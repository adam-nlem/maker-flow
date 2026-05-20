import { MediaType } from "./enums/MediaType";
import { ReviewStatus } from "./enums/ReviewStatus";
import { ReviewVersion, type ReviewVersionJSON } from "./ReviewVersion";
import { Script, type ScriptJSON } from "./Script";

export interface ReviewJSON {
    uuid: string;
    title: string;
    description?: string | null;
    notes?: string | null;
    mediaType: MediaType;
    createdAt: string;
    updatedAt: string;
    script: ScriptJSON | null;
    versions?: ReviewVersionJSON[];
    latestVersion?: ReviewVersionJSON | null;
}

export class Review {
    constructor(
        public readonly uuid: string,
        public title: string,
        public description: string | null,
        public notes: string | null,
        public mediaType: MediaType,
        public createdAt: string,
        public updatedAt: string,
        public script: Script | null,
        public versions: ReviewVersion[],
    ) { }

    static fromJSON(json: ReviewJSON): Review {
        const versionsJson = json.versions ?? (json.latestVersion ? [json.latestVersion] : []);

        return new Review(
            json.uuid,
            json.title,
            json.description ?? null,
            json.notes ?? null,
            json.mediaType,
            json.createdAt,
            json.updatedAt,
            json.script ? Script.fromJSON(json.script) : null,
            versionsJson.map(ReviewVersion.fromJSON),
        );
    }

    toJSON(): ReviewJSON {
        return {
            uuid: this.uuid,
            title: this.title,
            description: this.description,
            notes: this.notes,
            mediaType: this.mediaType,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            script: this.script ? this.script.toJSON() : null,
            versions: this.versions.map(v => v.toJSON()),
        };
    }

    get latestVersion(): ReviewVersion | null {
        if (this.versions.length === 0) return null;
        const sorted = [...this.versions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        return sorted[0];
    }

    get currentStatus(): ReviewStatus | null {
        return this.latestVersion?.status ?? null;
    }
}
