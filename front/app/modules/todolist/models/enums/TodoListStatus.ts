export enum TodoListStatus {
    Pending = 'pending',
    InProgress = 'in_progress',
    Completed = 'completed',
}

export const todoItemStatusToFrenchTranslation: Record<TodoListStatus, string> = {
    [TodoListStatus.Pending]: "À Faire",
    [TodoListStatus.InProgress]: "En Cours",
    [TodoListStatus.Completed]: "Terminée",
}
