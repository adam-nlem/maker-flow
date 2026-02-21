export interface ScriptTextJSON {
    uuid: string;
    content: string;
    position: number;
    type: 'text';
    createdAt: string;
    updatedAt?: string;
}

export class ScriptText {
    public readonly type = 'text' as const;

    constructor(
        public readonly uuid: string,
        public content: string,
        public position: number,
        public readonly createdAt: Date,
        public readonly updatedAt?: Date,
    ) { }

    static fromJSON(json: ScriptTextJSON): ScriptText {
        return new ScriptText(
            json.uuid,
            json.content,
            json.position,
            new Date(json.createdAt),
            json.updatedAt ? new Date(json.updatedAt) : undefined,
        )
    }

    toJSON(): ScriptTextJSON {
        return {
            uuid: this.uuid,
            content: this.content,
            position: this.position,
            type: this.type,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt?.toISOString(),
        }
    }
}
