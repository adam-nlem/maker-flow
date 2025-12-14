import { useEffect, useState } from "react";
import { httpClient } from "~/services/httpClient/httpClient";
import { CustomHttpException } from "~/services/httpClient/customHttpExceptions";
import { TodoListTag, type TodoListTagJSON } from "../../models/TodoListTag";

export function useListTodoListTagsWithSearch({ todoListUuid }: { todoListUuid: string }) {
    const [searchTerm, setSearchTerm] = useState("")
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
    const [todoListTags, setTodoListTags] = useState<TodoListTag[]>([])
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    // Debounce the search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm)
        }, 300)

        return () => clearTimeout(timer)
    }, [searchTerm])

    // Fetch tags when debounced search term changes
    useEffect(() => {
        const listTodoListTags = async () => {
            setIsLoading(true)
            try {
                const res = await httpClient.get('/modules/todo-lists/tags', {
                    params: {
                        todoListUuid,
                        searchTerm: debouncedSearchTerm || undefined,
                    }
                })
                const todoListTagsData = res.data.map((json: TodoListTagJSON) => TodoListTag.fromJSON(json))
                setTodoListTags(todoListTagsData)
                setErrorMessage(null)
            } catch (err) {
                setErrorMessage(err instanceof CustomHttpException ? err.errorMessage : "Une erreur est survenue")
            } finally {
                setIsLoading(false)
            }
        }

        listTodoListTags()
    }, [todoListUuid, debouncedSearchTerm])

    return {
        searchTerm,
        setSearchTerm,
        todoListTags,
        setTodoListTags,
        isLoading,
        errorMessage
    }
}