import { create } from 'zustand'

type CreateTodoListModalState = {
    isCreateModalOpen: boolean
}

type CreateTodoListModalAction = {
    setIsCreateModalOpen: (isOpen: boolean) => void
}

export const useCreateTodoListModalStore = create<CreateTodoListModalState & CreateTodoListModalAction>((set) => ({
    isCreateModalOpen: false,
    setIsCreateModalOpen: (isOpen) => set({ isCreateModalOpen: isOpen }),
}))
