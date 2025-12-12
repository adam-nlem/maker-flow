import { useState } from "react";
import { NotFoundException } from "~/services/httpClient/customHttpExceptions";
import { httpClient } from "~/services/httpClient/httpClient";
import type { Color } from "~/models/enums/Color";

export function useCreateTodoListTag({ todoListUuid }: { todoListUuid: string }) {
    const [title, setTitle] = useState("");
    const [color, setColor] = useState<Color | null>(null);

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    function resetForm() {
        setTitle("")
        setColor(null)
        setErrorMessage(null)
        setIsSubmitting(false)
    }

    async function createTodoListTag(): Promise<void> {
        setErrorMessage(null)
        setIsSubmitting(true)

        try {
            await httpClient.post('/modules/todo-lists/tags', {
                "todoListUuid": todoListUuid,
                "title": title,
                "color": color,
            })

            resetForm()
        } catch (err) {
            let message
            if (err instanceof NotFoundException) {
                message = "Vous n'avez pas de Todo List avec cet identifiant"
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
