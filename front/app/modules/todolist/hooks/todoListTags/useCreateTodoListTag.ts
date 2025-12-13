import { useState } from "react";
import { NotFoundException } from "~/services/httpClient/customHttpExceptions";
import { httpClient } from "~/services/httpClient/httpClient";
import { Color } from "~/models/enums/Color";
import { TodoListTag } from "../../models/TodoListTag";

export function useCreateTodoListTag({ todoListUuid }: { todoListUuid: string }) {
    const [title, setTitle] = useState("")
    const [color, setColor] = useState(Color.Purple)

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    function resetForm() {
        setTitle("")
        setColor(Color.Purple)
        setErrorMessage(null)
    }

    async function createTodoListTag(): Promise<TodoListTag | undefined> {
        setErrorMessage(null)
        setIsSubmitting(true)

        try {
            const res = await httpClient.post('/modules/todo-lists/tags', {
                "todoListUuid": todoListUuid,
                "title": title,
                "color": color,
            })

            resetForm()

            return TodoListTag.fromJSON(res.data);
        } catch (err) {
            let message
            if (err instanceof NotFoundException) {
                message = "Vous n'avez pas de tag avec cet identifiant"
            } else {
                message = "Une erreur est survenue lors de la création de votre tag"
            }
            setErrorMessage(err instanceof Error ? err.message : message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        title, setTitle,
        color, setColor,
        errorMessage, setErrorMessage,
        isSubmitting,
        createTodoListTag,
    }
}
