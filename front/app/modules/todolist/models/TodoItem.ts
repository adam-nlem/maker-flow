import type { TodoPriority } from "./enums/TodoPriority";
import { TodoCategory, type TodoCategoryJSON } from "./TodoCategory";

interface TodoItemJSON {
    uuid: string;
    title: string;
    content: string;
    priority?: TodoPriority;
    categories: TodoCategoryJSON[];
    createdAt: string;
    updatedAt?: string;
    finishedAt?: string;
    dueDate?: string;
}

export class TodoItem {
    constructor(
        public readonly uuid: string,
        public title: string,
        public content: string,
        public categories: TodoCategory[],
        public readonly createdAt: Date,
        public priority?: TodoPriority,
        public readonly updatedAt?: Date,
        public readonly finishedAt?: Date,
        public dueDate?: Date,
    ) { }

    static fromJSON(json: TodoItemJSON): TodoItem {
        return new TodoItem(
            json.uuid,
            json.title,
            json.content,
            json.categories.map(c => TodoCategory.fromJSON(c)),
            new Date(json.createdAt),
            json.priority,
            json.updatedAt ? new Date(json.updatedAt) : undefined,
            json.finishedAt ? new Date(json.finishedAt) : undefined,
            json.dueDate ? new Date(json.dueDate) : undefined,
        )
    }

    toJSON(): TodoItemJSON {
        return {
            uuid: this.uuid,
            title: this.title,
            content: this.content,
            priority: this.priority,
            categories: this.categories.map(c => c.toJSON()),
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt?.toISOString(),
            finishedAt: this.finishedAt?.toISOString(),
            dueDate: this.dueDate?.toISOString(),
        }
    }

    get isFinished(): boolean {
        return this.finishedAt !== undefined;
    }

    get isOverdue(): boolean {
        return this.dueDate !== undefined && this.dueDate < new Date() && !this.isFinished;
    }
}