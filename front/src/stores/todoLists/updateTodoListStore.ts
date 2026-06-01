import { createResettableStore } from '~/stores/createResettableStore'

type UpdateTodoListState = {
    updatingTodoListUuid: string | null
}

type UpdateTodoListAction = {
    setUpdatingTodoListUuid: (uuid: string | null) => void
}

export const useUpdateTodoListStore = createResettableStore<UpdateTodoListState & UpdateTodoListAction>()((set) => ({
    updatingTodoListUuid: null,
    setUpdatingTodoListUuid: (uuid) => set({ updatingTodoListUuid: uuid })
}))
