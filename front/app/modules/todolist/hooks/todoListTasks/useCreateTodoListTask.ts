import { useState } from "react";
import { NotFoundException } from "~/services/httpClient/customHttpExceptions";
import { httpClient } from "~/services/httpClient/httpClient";
import type { TodoListPriority } from "../../models/enums/TodoListPriority";
import type { TodoListStatus } from "../../models/enums/TodoListStatus";

export function useCreateTodoListTask({ todoListUuid }: { todoListUuid: string }) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState<string | null>(null);
    const [priority, setPriority] = useState<TodoListPriority | null>(null);
    const [status, setStatus] = useState<TodoListStatus | null>(null);
    const [dueDate, setDueDate] = useState<string | null>(null);
    const [tagUuids, setTagUuids] = useState<string[]>([]);

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    function resetForm() {
        setTitle("")
        setContent(null)
        setPriority(null)
        setStatus(null)
        setDueDate(null)
        setTagUuids([])
        setErrorMessage(null)
        setIsSubmitting(false)
    }

    async function createTodoListTask(): Promise<void> {
        setErrorMessage(null)
        setIsSubmitting(true)

        try {
            await httpClient.post('/modules/todo-lists/tasks', {
                "todoListUuid": todoListUuid,
                "title": title,
                "content": content,
                "priority": priority,
                "status": status,
                "dueDate": dueDate,
                "tagUuids": tagUuids,
            })

            resetForm()
        } catch (err) {
            let message
            if (err instanceof NotFoundException) {
                message = "Vous n'avez pas de Todo List avec cet identifiant"
            } else {
                message = "Une erreur est survenue lors de la création de votre tâche"
            }
            setErrorMessage(err instanceof Error ? err.message : message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        title, setTitle,
        content, setContent,
        priority, setPriority,
        status, setStatus,
        dueDate, setDueDate,
        tagUuids, setTagUuids,
        errorMessage, setErrorMessage,
        isSubmitting,
        createTodoListTask,
    }
}
