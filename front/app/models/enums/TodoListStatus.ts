export enum TodoListStatus {
    Pending = 'pending',
    InProgress = 'in_progress',
    Completed = 'completed',
}

export const todoListStatusToFrenchTranslation: Record<TodoListStatus, string> = {
    [TodoListStatus.Pending]: "À Faire",
    [TodoListStatus.InProgress]: "En Cours",
    [TodoListStatus.Completed]: "Terminée",
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
