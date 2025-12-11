import type { TodoListPriority } from "./enums/TodoListPriority";
import type { TodoListStatus } from "./enums/TodoListStatus";
import { TodoListTag, type TodoListTagJSON } from "./TodoListTag";

interface TodoListTaskJSON {
    uuid: string;
    title: string;
    content: string;
    status: TodoListStatus;
    priority?: TodoListPriority;
    tags: TodoListTagJSON[];
    createdAt: string;
    updatedAt?: string;
    finishedAt?: string;
    dueDate?: string;
}

export class TodoListTask {
    constructor(
        public readonly uuid: string,
        public title: string,
        public content: string,
        public tags: TodoListTag[],
        public readonly createdAt: Date,
        public status: TodoListStatus,
        public priority?: TodoListPriority,
        public readonly updatedAt?: Date,
        public readonly finishedAt?: Date,
        public dueDate?: Date,
    ) { }

    static fromJSON(json: TodoListTaskJSON): TodoListTask {
        return new TodoListTask(
            json.uuid,
            json.title,
            json.content,
            json.tags.map(c => TodoListTag.fromJSON(c)),
            new Date(json.createdAt),
            json.status,
            json.priority,
            json.updatedAt ? new Date(json.updatedAt) : undefined,
            json.finishedAt ? new Date(json.finishedAt) : undefined,
            json.dueDate ? new Date(json.dueDate) : undefined,
        )
    }

    toJSON(): TodoListTaskJSON {
        return {
            uuid: this.uuid,
            title: this.title,
            content: this.content,
            status: this.status,
            priority: this.priority,
            tags: this.tags.map(c => c.toJSON()),
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt?.toISOString(),
            finishedAt: this.finishedAt?.toISOString(),
            dueDate: this.dueDate?.toISOString(),
        }
    }
    
    //TODO: do this
    // get isOverdue(): boolean {
    // return this.dueDate !== undefined && this.dueDate < new Date() && !this.status ==;
    // }
}