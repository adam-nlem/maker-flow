import { create } from 'zustand'

type SelectProjectModalState = {
    isSelectModalOpen: boolean
}

type SelectProjectModalAction = {
    setIsSelectModalOpen: (isOpen: boolean) => void
}

export const useSelectProjectModalStore = create<SelectProjectModalState & SelectProjectModalAction>((set) => ({
    isSelectModalOpen: false,
    setIsSelectModalOpen: (isOpen) => set({ isSelectModalOpen: isOpen }),
}))
