import { useState } from "react";
import { NotFoundException } from "~/services/httpClient/customHttpExceptions";
import { httpClient } from "~/services/httpClient/httpClient";

export function useCreateTodoList({ userModuleUuid }: { userModuleUuid: string }) {
    const [title, setTitle] = useState("");

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    function resetForm() {
        setTitle("")
        setErrorMessage(null)
    }

    async function createTodoList(): Promise<void> {
        setErrorMessage(null)
        setIsSubmitting(true)

        try {
            await httpClient.post('/modules/todo-lists', {
                "userModuleUuid": userModuleUuid,
                "title": title,
            })

            resetForm()
        } catch (err) {
            let message
            if (err instanceof NotFoundException) {

                message = "Vous n'avez pas activé le module Todo List"
            } else {
                message = "Une erreur est survenue lors de la création de votre Todo List"
            }
            setErrorMessage(err instanceof Error ? err.message : message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        title, setTitle,
        errorMessage, setErrorMessage,
        isSubmitting,
        createTodoList,
    }
}