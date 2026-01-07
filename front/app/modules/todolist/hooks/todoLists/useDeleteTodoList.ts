import { useState } from "react";
import { httpClient } from "~/services/httpClient/httpClient";
import { NotFoundException } from "~/services/httpClient/customHttpExceptions";

export function useDeleteTodoList({ todoListUuid }: { todoListUuid: string }) {
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    async function deleteTodoList(): Promise<void> {
        setErrorMessage(null)
        setIsLoading(true)

        try {
            await httpClient.delete(`/modules/todo-lists/${todoListUuid}`)

            setErrorMessage(null)
            setIsLoading(false)


        } catch (err) {
            let message
            if (err instanceof NotFoundException) {
                message = "Vous n'avez pas de todo list avec cet identifiant"
            }
            else {
                message = "Une erreur est survenue lors de la suppression de votre todo list"
            }
            setErrorMessage(err instanceof Error ? err.message : message)
            setIsLoading(false)
        }
    }

    return {
        errorMessage, setErrorMessage,
        isLoading,
        deleteTodoList
    }
}