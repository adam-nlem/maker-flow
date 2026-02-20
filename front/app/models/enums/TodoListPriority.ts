import { ExclamationTriangleIcon } from "@heroicons/react/16/solid";

export enum TodoListPriority {
    Low = 'low',
    Medium = 'medium',
    High = 'high',
}

export const todoListPriorityToFrenchTranslation: Record<TodoListPriority, string> = {
    [TodoListPriority.Low]: "Basse",
    [TodoListPriority.Medium]: "Moyenne",
    [TodoListPriority.High]: "Haute",
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

