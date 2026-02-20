import type { TodoListStatus } from "~/models/enums/TodoListStatus";
import { TodoListTask, type TodoListTaskJSON } from "~/models/TodoListTask";

export interface TodoListTasksGroupedByStatusDTOJSON {
    status: TodoListStatus;
    todoListTasks: TodoListTaskJSON[];
}

export class TodoListTasksGroupedByStatusDTO {
    constructor(
        public readonly status: TodoListStatus,
        public todoListTasks: TodoListTask[],
    ) { }

    static fromJSON(json: TodoListTasksGroupedByStatusDTOJSON): TodoListTasksGroupedByStatusDTO {
        return new TodoListTasksGroupedByStatusDTO(
            json.status,
            json.todoListTasks.map(task => TodoListTask.fromJSON(task)),
        );
    }
}
