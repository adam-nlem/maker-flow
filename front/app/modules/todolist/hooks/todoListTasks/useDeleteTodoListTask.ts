import { useEffect, useState } from "react";
import { httpClient } from "~/services/httpClient/httpClient";
import { CustomHttpException, NotFoundException } from "~/services/httpClient/customHttpExceptions";
import { TodoListTask, type TodoListTaskJSON } from "../../models/TodoListTask";

export function useDeleteTodoListTask({ taskUuid }: { taskUuid: string }) {
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    async function deleteTodoListTask(): Promise<void> {
        setErrorMessage(null)
        setIsLoading(true)

        try {
            await httpClient.delete(`/modules/todo-lists/tasks/${taskUuid}`)

            setErrorMessage(null)
            setIsLoading(false)


        } catch (err) {
            let message
            if (err instanceof NotFoundException) {
                message = "Vous n'avez pas de tâche avec cet identifiant"
            }
            else {
                message = "Une erreur est survenue lors de la suppression de votre tâche"
            }
            setErrorMessage(err instanceof Error ? err.message : message)
            setIsLoading(false)
        }
    }

    return {
        errorMessage, setErrorMessage,
        isLoading,
        deleteTodoListTask
    }
}