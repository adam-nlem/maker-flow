import { MediaType } from "./enums/MediaType";
import { Script, type ScriptJSON } from "./Script";

export interface ReviewJSON {
    uuid: string;
    title: string;
    description?: string | null;
    notes?: string | null;
    mediaType: MediaType;
    createdAt: string;
    updatedAt?: string;
    script?: ScriptJSON | null;
}

export class Review {
    constructor(
        public readonly uuid: string,
        public title: string,
        public description: string | null,
        public notes: string | null,
        public mediaType: MediaType,
        public createdAt: string,
        public updatedAt: string | null,
        public script: Script | null,
    ) { }

    static fromJSON(json: ReviewJSON): Review {
        return new Review(
            json.uuid,
            json.title,
            json.description ?? null,
            json.notes ?? null,
            json.mediaType,
            json.createdAt,
            json.updatedAt ?? null,
            json.script ? Script.fromJSON(json.script) : null,
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
            updatedAt: this.updatedAt ?? undefined,
            script: this.script ? this.script.toJSON() : null,
        };
    }
}
