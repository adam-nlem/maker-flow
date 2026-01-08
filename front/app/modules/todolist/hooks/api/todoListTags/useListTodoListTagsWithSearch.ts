import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/services/httpClient/httpClient";
import { TodoListTag, type TodoListTagJSON } from "../../../models/TodoListTag";
import { todoListTagQueryKeys } from "./todoListTagQueryKeys";


export function useListTodoListTagsWithSearch({ todoListUuid }: { todoListUuid: string }) {
    const [searchTerm, setSearchTerm] = useState("")
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")

    // Debounce the search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm)
        }, 300)

        return () => clearTimeout(timer)
    }, [searchTerm])

    const query = useQuery({
        queryKey: todoListTagQueryKeys.list(todoListUuid, debouncedSearchTerm),
        queryFn: async () => {
            const res = await httpClient.get('/modules/todo-lists/tags', {
                params: {
                    todoListUuid,
                    searchTerm: debouncedSearchTerm || undefined,
                }
            })
            return res.data.map((json: TodoListTagJSON) => TodoListTag.fromJSON(json)) as TodoListTag[]
        },
    })

    return {
        searchTerm,
        setSearchTerm,
        todoListTags: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error,
    }
}