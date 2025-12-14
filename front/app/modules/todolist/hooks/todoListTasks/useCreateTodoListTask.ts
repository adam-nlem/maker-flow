import { useState } from "react";
import { NotFoundException } from "~/services/httpClient/customHttpExceptions";
import { httpClient } from "~/services/httpClient/httpClient";
import type { TodoListPriority } from "../../models/enums/TodoListPriority";
import type { TodoListStatus } from "../../models/enums/TodoListStatus";
import type { TodoListTag } from "../../models/TodoListTag";

export function useCreateTodoListTask({ todoListUuid }: { todoListUuid: string }) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState<string | undefined>(undefined);
    const [priority, setPriority] = useState<TodoListPriority | undefined>(undefined);
    const [status, setStatus] = useState<TodoListStatus | undefined>(undefined);
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
    const [tags, setTags] = useState<TodoListTag[]>([]);

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    function resetForm() {
        setTitle("")
        setContent(undefined)
        setPriority(undefined)
        setStatus(undefined)
        setDueDate(undefined)
        setTags([])
        setErrorMessage(null)
        setIsSubmitting(false)
    }

    async function createTodoListTask(): Promise<void> {
        setErrorMessage(null)
        setIsSubmitting(true)

        console.log(dueDate?.toISOString())

        try {
            await httpClient.post('/modules/todo-lists/tasks', {
                "todoListUuid": todoListUuid,
                "title": title,
                "content": content,
                "priority": priority,
                "status": status,
                "dueDate": dueDate ? dueDate.toLocaleDateString('sv-SE') : undefined, // 'sv-SE' outputs YYYY-MM-DD
                "tagUuids": tags.map((tag) => tag.uuid),
            })

            resetForm()
        } catch (err) {
            let message
            if (err instanceof NotFoundException) {
                message = "Vous n'avez pas de tâche avec cet identifiant"
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
        tags, setTags,
        errorMessage, setErrorMessage,
        isSubmitting,
        createTodoListTask,
    }
}
