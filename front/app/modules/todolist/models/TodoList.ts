import type { TodoListTask, TodoListTaskJSON } from "./TodoListTask";
import type { TodoListTag, TodoListTagJSON } from "./TodoListTag";

export interface TodoListJSON {
    uuid: string;
    title: string;
    createdAt: string;
    updatedAt?: string;
    todoListTasks?: TodoListTaskJSON[];
    todoListTags?: TodoListTagJSON[];
}

export class TodoList {
    constructor(
        public readonly uuid: string,
        public title: string,
        public readonly createdAt: Date,
        public readonly updatedAt?: Date,
        public todoListTasks?: TodoListTask[],
        public todoListTags?: TodoListTag[],
    ) { }

    static fromJSON(json: TodoListJSON): TodoList {
        return new TodoList(
            json.uuid,
            json.title,
            new Date(json.createdAt),
            json.updatedAt ? new Date(json.updatedAt) : undefined,
        )
    }

    toJSON(): TodoListJSON {
        return {
            uuid: this.uuid,
            title: this.title,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt?.toISOString(),
        }
    }
}
