import { ChapterType } from "./enums/ChapterType";

export interface ScriptChapterJSON {
    uuid: string;
    title: string;
    description?: string;
    chapterType: ChapterType;
    position: number;
    type: 'chapter';
    createdAt: string;
    updatedAt?: string;
}

export class ScriptChapter {
    public readonly type = 'chapter' as const;

    constructor(
        public readonly uuid: string,
        public title: string,
        public description: string | undefined,
        public chapterType: ChapterType,
        public position: number,
        public readonly createdAt: Date,
        public readonly updatedAt?: Date,
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
