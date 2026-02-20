import { useEffect } from "react"
import type { TodoList } from "~/models/TodoList"
import { useFocusTodoListStore } from "~/stores/todoLists/focusTodoListStore"


/**
 * This hook combines a Zustand store with validation logic.
 * 
 * - The store (focusedTodoListStore) holds the raw state and handles localStorage persistence.
 * - This hook adds fallback logic: if the stored UUID is invalid or missing, 
 *   it automatically selects the first available todo list.
 * 
 * This separation keeps the store pure (just state + persistence) while the hook
 * handles business logic that depends on external data (the todoLists array).
 */
export default function useSelectFocusedTodoList({ todoLists }: { todoLists: TodoList[] }) {
    const focusedTodoListUuid = useFocusTodoListStore((state) => state.focusedTodoListUuid)
    const setFocusedTodoListUuid = useFocusTodoListStore((state) => state.setFocusedTodoListUuid)

    useEffect(() => {
        if (todoLists.length === 0) return

        const existsInList = todoLists.some((t) => t.uuid === focusedTodoListUuid)

        if (!focusedTodoListUuid || !existsInList) {
            setFocusedTodoListUuid(todoLists[0].uuid)
        }
    }, [todoLists, focusedTodoListUuid, setFocusedTodoListUuid])

    return {
        focusedTodoListUuid,
        setFocusedTodoListUuid
    }
}
