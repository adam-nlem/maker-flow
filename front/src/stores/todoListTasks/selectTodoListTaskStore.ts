import { create } from 'zustand'

type SelectTodoListTaskState = {
    selectedTaskUuid: string | null
}

type SelectTodoListTaskAction = {
    setSelectedTaskUuid: (uuid: string | null) => void
}

export const useSelectTodoListTaskStore = create<SelectTodoListTaskState & SelectTodoListTaskAction>((set) => ({
    selectedTaskUuid: null,
    setSelectedTaskUuid: (uuid) => set({ selectedTaskUuid: uuid })
}))
