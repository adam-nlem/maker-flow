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
