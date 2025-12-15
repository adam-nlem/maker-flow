import { useEffect, useState } from "react";
import { NotFoundException } from "~/services/httpClient/customHttpExceptions";
import { httpClient } from "~/services/httpClient/httpClient";
import { TodoList } from "../../models/TodoList";

export function useUpdateTodoList({ todoList }: { todoList?: TodoList }) {
    const [title, setTitle] = useState(todoList?.title ?? "");
    const [debouncedTitle, setDebouncedTitle] = useState(todoList?.title ?? "");

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sync title when todoList changes (e.g., navigating between lists)
    useEffect(() => {
        setTitle(todoList?.title ?? "");
        setDebouncedTitle(todoList?.title ?? "");
    }, [todoList?.uuid]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedTitle(title);
        }, 300);

        return () => clearTimeout(timer);
    }, [title]);

    useEffect(() => {
        if (!todoList) return;


        // Do not PATCH if nothing changed
        if (debouncedTitle === "" || debouncedTitle === todoList.title) return;

        let isCancelled = false;

        async function updateTodoList() {
            setErrorMessage(null);
            setIsSubmitting(true);

            try {
                const res = await httpClient.patch(
                    `/modules/todo-lists/${todoList!.uuid}`,
                    { title: debouncedTitle }
                );

                if (!isCancelled) {
                    setIsSubmitting(false);
                }

                return TodoList.fromJSON(res.data);
            } catch (err) {
                if (isCancelled) return;

                let message =
                    err instanceof NotFoundException
                        ? "Vous n'avez pas de todo list avec cet identifiant"
                        : "Une erreur est survenue lors de la mise à jour de votre todo list";

                setErrorMessage(err instanceof Error ? err.message : message);
                setIsSubmitting(false);
            }
        }

        updateTodoList();

        return () => {
            isCancelled = true;
        };
    }, [debouncedTitle]);

    return {
        title,
        setTitle,
        errorMessage,
        isSubmitting,
    };
}
