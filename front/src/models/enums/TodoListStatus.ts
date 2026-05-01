export enum TodoListStatus {
    Pending = 'pending',
    InProgress = 'in_progress',
    Completed = 'completed',
}

export const todoListStatusTranslationKeys: Record<TodoListStatus, string> = {
    [TodoListStatus.Pending]: "enums:todoListStatus.pending",
    [TodoListStatus.InProgress]: "enums:todoListStatus.inProgress",
    [TodoListStatus.Completed]: "enums:todoListStatus.completed",
}

export const todoListStatusToTextClass: Record<TodoListStatus, string> = {
    [TodoListStatus.Pending]: "text-green",
    [TodoListStatus.InProgress]: "text-yellow",
    [TodoListStatus.Completed]: "text-purple",
}

export const todoListStatusToBgClass: Record<TodoListStatus, string> = {
    [TodoListStatus.Pending]: "bg-green/30",
    [TodoListStatus.InProgress]: "bg-yellow/30",
    [TodoListStatus.Completed]: "bg-purple/30",
}

export const todoListStatusOptions = Object.values(TodoListStatus);
