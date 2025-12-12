import { useEffect, useState } from "react";
import { TodoList, type TodoListJSON } from "../../models/TodoList";
import { httpClient } from "~/services/httpClient/httpClient";
import { CustomHttpException } from "~/services/httpClient/customHttpExceptions";

export function useListTodoLists({ userModuleUuid }: { userModuleUuid: string }) {
    const [todoLists, setTodoLists] = useState<TodoList[]>([])

    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const listTodoLists = async () => {
            setIsLoading(true)

            try {
                const res = await httpClient.get(`/modules/todo-lists/${userModuleUuid}`)
                const todoListsData = res.data.map((json: TodoListJSON) => TodoList.fromJSON(json))
                setTodoLists(todoListsData)
                setErrorMessage(null)
            } catch (err) {
                setErrorMessage(err instanceof CustomHttpException ? err.errorMessage : "Une erreur est survenue")
            } finally {
                setIsLoading(false)
            }
        }

        listTodoLists()
    }, [userModuleUuid])

    return {
        todoLists,
        isLoading,
        errorMessage
    }
}