export enum TodoItemStatus {
    Pending = 'pending',
    InProgress = 'in_progress',
    Completed = 'completed',
}

export const todoItemStatusToFrenchTranslation: Record<TodoItemStatus, string> = {
    [TodoItemStatus.Pending]: "À Faire",
    [TodoItemStatus.InProgress]: "En Cours",
    [TodoItemStatus.Completed]: "Terminée",
}
