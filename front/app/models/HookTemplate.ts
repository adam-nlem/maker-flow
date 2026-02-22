export interface HookTemplateJSON {
    uuid: string;
    title: string;
    content: string;
    isPublic: boolean;
    createdAt: string;
    updatedAt?: string;
}

export class HookTemplate {
    constructor(
        public readonly uuid: string,
        public title: string,
        public content: string,
        public isPublic: boolean,
        public readonly createdAt: Date,
        public readonly updatedAt?: Date,
    ) {}

    static fromJSON(json: HookTemplateJSON): HookTemplate {
        return new HookTemplate(
            json.uuid,
            json.title,
            json.content,
            json.isPublic,
            new Date(json.createdAt),
            json.updatedAt ? new Date(json.updatedAt) : undefined,
        );
    }

    toJSON(): HookTemplateJSON {
        return {
            uuid: this.uuid,
            title: this.title,
            content: this.content,
            isPublic: this.isPublic,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt?.toISOString(),
        };
    }
}
