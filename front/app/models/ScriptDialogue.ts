import { DialogueSubject, type DialogueSubjectJSON } from "./DialogueSubject";

export interface ScriptDialogueJSON {
    uuid: string;
    title: string;
    description?: string;
    dialogueSubjects?: DialogueSubjectJSON[];
    position: number;
    type: 'dialogue';
    createdAt: string;
    updatedAt?: string;
}

export class ScriptDialogue {
    public readonly type = 'dialogue' as const;

    constructor(
        public readonly uuid: string,
        public title: string,
        public description: string | undefined,
        public dialogueSubjects: DialogueSubject[],
        public position: number,
        public readonly createdAt: Date,
        public readonly updatedAt?: Date,
    ) { }

    static fromJSON(json: ScriptDialogueJSON): ScriptDialogue {
        return new ScriptDialogue(
            json.uuid,
            json.title,
            json.description,
            (json.dialogueSubjects ?? []).map(DialogueSubject.fromJSON),
            json.position,
            new Date(json.createdAt),
            json.updatedAt ? new Date(json.updatedAt) : undefined,
        )
    }

    toJSON(): ScriptDialogueJSON {
        return {
            uuid: this.uuid,
            title: this.title,
            description: this.description,
            dialogueSubjects: this.dialogueSubjects.map(s => s.toJSON()),
            position: this.position,
            type: this.type,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt?.toISOString(),
        }
    }
}
