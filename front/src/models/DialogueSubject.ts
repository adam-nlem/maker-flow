export interface DialogueSubjectJSON {
    uuid: string;
    speaker: string;
    content: string;
    position: number;
    createdAt: string;
    updatedAt?: string;
}

export class DialogueSubject {
    constructor(
        public readonly uuid: string,
        public speaker: string,
        public content: string,
        public position: number,
        public readonly createdAt: Date,
        public readonly updatedAt?: Date,
    ) { }

    static fromJSON(json: DialogueSubjectJSON): DialogueSubject {
        return new DialogueSubject(
            json.uuid,
            json.speaker,
            json.content,
            json.position,
            new Date(json.createdAt),
            json.updatedAt ? new Date(json.updatedAt) : undefined,
        )
    }

    toJSON(): DialogueSubjectJSON {
        return {
            uuid: this.uuid,
            speaker: this.speaker,
            content: this.content,
            position: this.position,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt?.toISOString(),
        }
    }
}
