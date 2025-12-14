import { useState } from "react";
import { NotFoundException } from "~/services/httpClient/customHttpExceptions";
import { httpClient } from "~/services/httpClient/httpClient";
import { TodoListTask } from "../../models/TodoListTask";
import type { TodoListTag } from "../../models/TodoListTag";
import type { TodoListPriority } from "../../models/enums/TodoListPriority";
import type { TodoListStatus } from "../../models/enums/TodoListStatus";

interface UpdateTodoListTaskData {
    title?: string;
    content?: string;
    status?: TodoListStatus;
    priority?: TodoListPriority | null;
    dueDate?: Date | null;
    tags?: TodoListTag[];
}

export function useUpdateTodoListTask() {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function updateTodoListTask(taskUuid: string, data: UpdateTodoListTaskData): Promise<TodoListTask | undefined> {
        setErrorMessage(null)
        setIsSubmitting(true)

        try {
            const res = await httpClient.patch(`/modules/todo-lists/tasks/${taskUuid}`, {
                ...data,
                dueDate: data.dueDate !== undefined
                    ? (data.dueDate ? data.dueDate.toLocaleDateString('sv-SE') : null)
                    : undefined,
                tagUuids: data.tags?.map((tag) => tag.uuid),
            })

            setErrorMessage(null)
            setIsSubmitting(false)

            return TodoListTask.fromJSON(res.data);
        } catch (err) {
            let message
            if (err instanceof NotFoundException) {
                message = "Vous n'avez pas de tâche avec cet identifiant"
            }
            else {
                message = "Une erreur est survenue lors de la mise à jour de votre tâche"
            }
            setErrorMessage(err instanceof Error ? err.message : message)
            setIsSubmitting(false)
        }
    }

    return {
        errorMessage,
        isSubmitting,
        updateTodoListTask,
    }
}
