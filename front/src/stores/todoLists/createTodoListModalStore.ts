import { createResettableStore } from '~/stores/createResettableStore'

type CreateTodoListModalState = {
    isCreateModalOpen: boolean
}

type CreateTodoListModalAction = {
    setIsCreateModalOpen: (isOpen: boolean) => void
}

export const useCreateTodoListModalStore = createResettableStore<CreateTodoListModalState & CreateTodoListModalAction>()((set) => ({
    isCreateModalOpen: false,
    setIsCreateModalOpen: (isOpen) => set({ isCreateModalOpen: isOpen }),
}))
