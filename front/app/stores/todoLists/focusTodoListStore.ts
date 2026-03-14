import { persist } from 'zustand/middleware'
import { createResettableStore } from '~/stores/createResettableStore'

type FocusTodoListState = {
    focusedTodoListUuid: string | null
}

type FocusTodoListAction = {
    setFocusedTodoListUuid: (uuid: string | null) => void
}

export const useFocusTodoListStore = createResettableStore<FocusTodoListState & FocusTodoListAction>()(
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
