import { create } from 'zustand'

type UpdateTodoListState = {
    updatingTodoListUuid: string | null
}

type UpdateTodoListAction = {
    setUpdatingTodoListUuid: (uuid: string | null) => void
}

export const useUpdateTodoListStore = create<UpdateTodoListState & UpdateTodoListAction>((set) => ({
    updatingTodoListUuid: null,
    setUpdatingTodoListUuid: (uuid) => set({ updatingTodoListUuid: uuid })
}))
