import { ChapterType } from "./enums/ChapterType";
import { ScriptPartType } from "./enums/ScriptPartType";

export interface ScriptChapterJSON {
    uuid: string;
    title: string;
    description?: string;
    chapterType: ChapterType;
    position: number;
    type: ScriptPartType.Chapter;
    generationUuid?: string;
    createdAt: string;
    updatedAt?: string;
}

export class ScriptChapter {
    public readonly type = ScriptPartType.Chapter;

    constructor(
        public readonly uuid: string,
        public title: string,
        public description: string | undefined,
        public chapterType: ChapterType,
        public position: number,
        public readonly createdAt: Date,
        public readonly updatedAt?: Date,
        public readonly generationUuid?: string,
    ) { }

    static fromJSON(json: ScriptChapterJSON): ScriptChapter {
        return new ScriptChapter(
            json.uuid,
            json.title,
            json.description,
            json.chapterType,
            json.position,
            new Date(json.createdAt),
            json.updatedAt ? new Date(json.updatedAt) : undefined,
            json.generationUuid,
        )
    }

    toJSON(): ScriptChapterJSON {
        return {
            uuid: this.uuid,
            title: this.title,
            description: this.description,
            chapterType: this.chapterType,
            position: this.position,
            type: this.type,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt?.toISOString(),
        }
    }
}
