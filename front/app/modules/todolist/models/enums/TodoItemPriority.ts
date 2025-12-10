export enum TodoItemPriority {
    Low = 'low',
    Medium = 'medium',
    High = 'high',
}

export const todoItemPriorityToFrenchTranslation: Record<TodoItemPriority, string> = {
    [TodoItemPriority.Low]: "Basse",
    [TodoItemPriority.Medium]: "Moyenne",
    [TodoItemPriority.High]: "Haute",
}

export const todoItemPriorityToTextClass: Record<TodoItemPriority, string> = {
    [TodoItemPriority.Low]: "text-yellow-400",
    [TodoItemPriority.Medium]: "text-orange-400",
    [TodoItemPriority.High]: "text-danger",
}

export const todoItemPriorityToBgClass: Record<TodoItemPriority, string> = {
    [TodoItemPriority.Low]: "bg-yellow-400/30",
    [TodoItemPriority.Medium]: "bg-orange-400/30",
    [TodoItemPriority.High]: "bg-danger/30",
}