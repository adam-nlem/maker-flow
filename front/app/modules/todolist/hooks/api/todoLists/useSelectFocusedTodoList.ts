import { useEffect, useState } from "react";
import type { TodoList } from "../../../models/TodoList";


const LOCAL_STORAGE_KEY = "app:todo-list:focused";

export default function useSelectFocusedTodoList({ todoLists }: { todoLists: TodoList[] }) {
    const [focusedTodoListUuid, setFocusedTodoListUuid] = useState<string | null>(() => {
        if (typeof window === "undefined") return null
        return localStorage.getItem(LOCAL_STORAGE_KEY)
    })

    useEffect(() => {
        if (todoLists.length === 0) return

        const existsInList = todoLists.some((t) => t.uuid === focusedTodoListUuid)

        if (!focusedTodoListUuid || !existsInList) {
            setFocusedTodoListUuid(todoLists[0].uuid)
        }
    }, [todoLists, focusedTodoListUuid])

    useEffect(() => {
        if (typeof window === "undefined") return

        if (focusedTodoListUuid) {
            localStorage.setItem(LOCAL_STORAGE_KEY, focusedTodoListUuid)
        }
    }, [focusedTodoListUuid])

    return {
        focusedTodoListUuid, setFocusedTodoListUuid
    }
}
