import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type FocusTodoListState = {
    focusedTodoListUuid: string | null
}

type FocusTodoListAction = {
    setFocusedTodoListUuid: (uuid: string | null) => void
}

export const useFocusTodoListStore = create<FocusTodoListState & FocusTodoListAction>()(
    persist(
        (set) => ({
            focusedTodoListUuid: null,
            setFocusedTodoListUuid: (uuid) => set({ focusedTodoListUuid: uuid })
        }),
        {
            name: "app:todo-list:focused",
        }
    )
)
