import { createResettableStore } from '~/stores/createResettableStore'

type SelectTodoListTaskState = {
    selectedTaskUuid: string | null
}

type SelectTodoListTaskAction = {
    setSelectedTaskUuid: (uuid: string | null) => void
}

export const useSelectTodoListTaskStore = createResettableStore<SelectTodoListTaskState & SelectTodoListTaskAction>()((set) => ({
    selectedTaskUuid: null,
    setSelectedTaskUuid: (uuid) => set({ selectedTaskUuid: uuid })
}))
