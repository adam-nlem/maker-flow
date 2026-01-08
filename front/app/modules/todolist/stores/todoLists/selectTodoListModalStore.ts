import { create } from 'zustand'

type SelectTodoListModalState = {
    isSelectModalOpen: boolean
}

type SelectTodoListModalAction = {
    setIsSelectModalOpen: (isOpen: boolean) => void
}

export const useSelectTodoListModalStore = create<SelectTodoListModalState & SelectTodoListModalAction>((set) => ({
    isSelectModalOpen: false,
    setIsSelectModalOpen: (isOpen) => set({ isSelectModalOpen: isOpen }),
}))
