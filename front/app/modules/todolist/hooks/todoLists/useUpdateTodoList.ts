import { useEffect, useState } from "react";
import { NotFoundException } from "~/services/httpClient/customHttpExceptions";
import { httpClient } from "~/services/httpClient/httpClient";
import { TodoList } from "../../models/TodoList";

export function useUpdateTodoList({ todoList }: {
    todoList?: TodoList
}) {
    const [title, setTitle] = useState(todoList?.title ?? "");

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    function resetForm() {
        setTitle("")
        setErrorMessage(null)
    }

    async function updateTodoList(): Promise<TodoList | undefined> {
        setErrorMessage(null)
        setIsSubmitting(true)

        try {
            const res = await httpClient.patch(
                `/modules/todo-lists/${todoList!.uuid}`,
                { title: title }
            );

            resetForm()

            return TodoList.fromJSON(res.data)
        } catch (err) {
            let message =
                err instanceof NotFoundException
                    ? "Vous n'avez pas de todo list avec cet identifiant"
                    : "Une erreur est survenue lors de la mise à jour de votre todo list";
            setErrorMessage(err instanceof Error ? err.message : message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        title, setTitle,
        errorMessage,
        isSubmitting,
        updateTodoList,
    };
}
