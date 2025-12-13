import { useEffect, useState } from "react";
import { httpClient } from "~/services/httpClient/httpClient";
import { CustomHttpException, NotFoundException } from "~/services/httpClient/customHttpExceptions";
import { TodoListTag, type TodoListTagJSON } from "../../models/TodoListTag";

export function useDeleteTodoListTag({ tagUuid }: { tagUuid: string }) {
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    async function deleteTodoListTag(): Promise<void> {
        setErrorMessage(null)
        setIsLoading(true)

        try {
            await httpClient.delete(`/modules/todo-lists/tags/${tagUuid}`)

            setErrorMessage(null)
            setIsLoading(false)


        } catch (err) {
            let message
            if (err instanceof NotFoundException) {
                message = "Vous n'avez pas de tag avec cet identifiant"
            }
            else {
                message = "Une erreur est survenue lors de la création de votre tag"
            }
            setErrorMessage(err instanceof Error ? err.message : message)
            setIsLoading(false)
        }
    }

    return {
        errorMessage, setErrorMessage,
        isLoading,
        deleteTodoListTag
    }
}