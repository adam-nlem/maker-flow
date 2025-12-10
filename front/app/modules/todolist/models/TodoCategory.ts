import type { Color } from "~/models/enums/Color";

export interface TodoCategoryJSON {
    uuid: string;
    title: string;
    color: Color;
    createdAt: string;
    updatedAt?: string;
}

export class TodoCategory {
    constructor(
        public readonly uuid: string,
        public title: string,
        public color: Color,
        public readonly createdAt: Date,
        public readonly updatedAt?: Date,
    ) { }

    static fromJSON(json: TodoCategoryJSON): TodoCategory {
        return new TodoCategory(
            json.uuid,
            json.title,
            json.color,
            new Date(json.createdAt),
            json.updatedAt ? new Date(json.updatedAt) : undefined,
        )
    }

    toJSON(): TodoCategoryJSON {
        return {
            uuid: this.uuid,
            title: this.title,
            color: this.color,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt?.toISOString(),
        }
    }
}
