import { create } from 'zustand'

type TodoListTaskState = {
    selectedTaskUuid: string | null
}

type TodoListTaskAction = {
    setSelectedTaskUuid: (uuid: string | null) => void
}

export const useTodoListTaskStore = create<TodoListTaskState & TodoListTaskAction>((set) => ({
    selectedTaskUuid: null,
    setSelectedTaskUuid: (uuid) => set({ selectedTaskUuid: uuid })
}))
