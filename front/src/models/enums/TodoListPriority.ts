export enum TodoListPriority {
    Low = 'low',
    Medium = 'medium',
    High = 'high',
}

export const todoListPriorityTranslationKeys: Record<TodoListPriority, string> = {
    [TodoListPriority.Low]: "enums:todoListPriority.low",
    [TodoListPriority.Medium]: "enums:todoListPriority.medium",
    [TodoListPriority.High]: "enums:todoListPriority.high",
}

export const todoListPriorityToTextClass: Record<TodoListPriority, string> = {
    [TodoListPriority.Low]: "text-yellow-400",
    [TodoListPriority.Medium]: "text-orange-400",
    [TodoListPriority.High]: "text-danger",
}

export const todoListPriorityToBgClass: Record<TodoListPriority, string> = {
    [TodoListPriority.Low]: "bg-yellow-400/30",
    [TodoListPriority.Medium]: "bg-orange-400/30",
    [TodoListPriority.High]: "bg-danger/30",
}

export const todoListPriorityOptions = Object.values(TodoListPriority);

