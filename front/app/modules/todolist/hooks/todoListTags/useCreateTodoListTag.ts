import { useState } from "react";
import { NotFoundException } from "~/services/httpClient/customHttpExceptions";
import { httpClient } from "~/services/httpClient/httpClient";
import type { Color } from "~/models/enums/Color";
import { TodoListTag } from "../../models/TodoListTag";

export function useCreateTodoListTag({ todoListUuid, title }: { todoListUuid: string, title: string }) {

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function createTodoListTag(): Promise<TodoListTag | undefined> {
        setErrorMessage(null)
        setIsSubmitting(true)

        try {
            const res = await httpClient.post('/modules/todo-lists/tags', {
                "todoListUuid": todoListUuid,
                "title": title,
            })

            setErrorMessage(null)
            setIsSubmitting(false)

            return TodoListTag.fromJSON(res.data);
        } catch (err) {
            let message
            if (err instanceof NotFoundException) {
                message = "Vous n'avez pas de Todo List avec cet identifiant"
            } else {
                message = "Une erreur est survenue lors de la création de votre tag"
            }
            setErrorMessage(err instanceof Error ? err.message : message)
            setIsSubmitting(false)
        }
    }

    return {
        errorMessage, setErrorMessage,
        isSubmitting,
        createTodoListTag,
    }
}
