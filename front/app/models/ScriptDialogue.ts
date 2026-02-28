import { DialogueSubject, type DialogueSubjectJSON } from "./DialogueSubject";
import { ScriptPartType } from "./enums/ScriptPartType";

export interface ScriptDialogueJSON {
    uuid: string;
    title: string;
    description?: string;
    dialogueSubjects?: DialogueSubjectJSON[];
    position: number;
    type: ScriptPartType.Dialogue;
    generationUuid?: string;
    createdAt: string;
    updatedAt?: string;
}

export class ScriptDialogue {
    public readonly type = ScriptPartType.Dialogue;

    constructor(
        public readonly uuid: string,
        public title: string,
        public description: string | undefined,
        public dialogueSubjects: DialogueSubject[],
        public position: number,
        public readonly createdAt: Date,
        public readonly updatedAt?: Date,
        public readonly generationUuid?: string,
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
            json.generationUuid,
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
