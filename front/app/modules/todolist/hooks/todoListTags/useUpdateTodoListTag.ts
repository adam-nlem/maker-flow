import { useState } from "react";
import { ConflictException, NotFoundException } from "~/services/httpClient/customHttpExceptions";
import { httpClient } from "~/services/httpClient/httpClient";
import type { Color } from "~/models/enums/Color";
import { TodoListTag } from "../../models/TodoListTag";

export function useUpdateTodoListTag({ tag }: { tag: TodoListTag }) {
    const [title, setTitle] = useState(tag.title)
    const [color, setColor] = useState(tag.color)

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function updateTodoListTag(): Promise<TodoListTag | undefined> {
        setErrorMessage(null)
        setIsSubmitting(true)

        try {
            const res = await httpClient.patch(`/modules/todo-lists/tags/${tag.uuid}`, {
                "title": title,
                "color": color,
            })

            setErrorMessage(null)
            setIsSubmitting(false)

            return TodoListTag.fromJSON(res.data);
        } catch (err) {
            let message
            if (err instanceof NotFoundException) {
                message = "Vous n'avez pas de tag avec cet identifiant"
            } else if (err instanceof ConflictException) {
                message = "Ce tag existe déjà pour cette todo list"
            }
            else {
                message = "Une erreur est survenue lors de la création de votre tag"
            }
            setErrorMessage(err instanceof Error ? err.message : message)
            setIsSubmitting(false)
        }
    }

    return {
        title, setTitle,
        color, setColor,
        errorMessage, setErrorMessage,
        isSubmitting,
        updateTodoListTag,
    }
}
