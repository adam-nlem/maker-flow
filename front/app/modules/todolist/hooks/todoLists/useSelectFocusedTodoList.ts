import { useEffect, useMemo, useState } from "react";
import type { TodoList } from "../../models/TodoList";


const LOCAL_STORAGE_KEY = "app:todo-list:focused";

export default function useSelectFocusedTodoList({ todoLists }: { todoLists: TodoList[]; }) {
    const [focusedTodoList, setFocusedTodoList] = useState<TodoList | null>(null)

    useEffect(() => {
        if (!todoLists.length || focusedTodoList) return;

        const isBrowser = typeof window !== "undefined"

        const focusedTodoListUuid = isBrowser ? localStorage.getItem(LOCAL_STORAGE_KEY) : null;


        const todoList = todoLists.find((todoList) => todoList.uuid === focusedTodoListUuid) ?? todoLists[0]

        setFocusedTodoList(todoList);
    }, [todoLists]);

    useEffect(() => {
        if (typeof window === "undefined") return

        if (focusedTodoList) {
            localStorage.setItem(LOCAL_STORAGE_KEY, focusedTodoList.uuid)
        }
    }, [focusedTodoList])

    return {
        focusedTodoList, setFocusedTodoList
    }
}
