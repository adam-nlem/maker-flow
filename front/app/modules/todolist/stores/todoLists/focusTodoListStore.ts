import { create } from 'zustand'

const LOCAL_STORAGE_KEY = "app:todo-list:focused"

type FocusTodoListState = {
    focusedTodoListUuid: string | null
}

type FocusTodoListAction = {
    setFocusedTodoListUuid: (uuid: string | null) => void
}

export const useFocusTodoListStore = create<FocusTodoListState & FocusTodoListAction>((set) => ({
    focusedTodoListUuid: typeof window !== "undefined" ? localStorage.getItem(LOCAL_STORAGE_KEY) : null,

    setFocusedTodoListUuid: (uuid) => {
        if (typeof window !== "undefined" && uuid) {
            localStorage.setItem(LOCAL_STORAGE_KEY, uuid)
        }
        set({ focusedTodoListUuid: uuid })
    }
}))
