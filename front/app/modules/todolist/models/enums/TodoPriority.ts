export enum TodoPriority {
    Low = 'low',
    Medium = 'medium',
    High = 'high',
}

export const todoPriorityToFrenchTranslation: Record<TodoPriority, string> = {
    [TodoPriority.Low]: "Basse",
    [TodoPriority.Medium]: "Moyenne",
    [TodoPriority.High]: "Haute",
}

export const todoPriorityToTextClass: Record<TodoPriority, string> = {
    [TodoPriority.Low]: "text-yellow-400",
    [TodoPriority.Medium]: "text-orange-400",
    [TodoPriority.High]: "text-danger",
}

export const todoPriorityToBgClass: Record<TodoPriority, string> = {
    [TodoPriority.Low]: "bg-yellow-400/30",
    [TodoPriority.Medium]: "bg-orange-400/30",
    [TodoPriority.High]: "bg-danger/30",
}